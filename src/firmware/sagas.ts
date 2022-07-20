// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import {
    FirmwareReader,
    FirmwareReaderError,
    HubType,
    encodeHubName,
} from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import { AnyAction } from 'redux';
import { ActionPattern } from 'redux-saga/effects';
import {
    SagaGenerator,
    all,
    call,
    cancel,
    delay,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import {
    checksumRequest,
    checksumResponse,
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didFailToRequest,
    didRequest,
    disconnect,
    eraseRequest,
    eraseResponse,
    errorResponse,
    infoRequest,
    infoResponse,
    initRequest,
    initResponse,
    programRequest,
    programResponse,
    rebootRequest,
} from '../lwp3-bootloader/actions';
import { MaxProgramFlashSize, Result } from '../lwp3-bootloader/protocol';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import { compile, didCompile, didFailToCompile } from '../mpy/actions';
import { RootState } from '../reducers';
import { defined, ensureError, hex, maybe } from '../utils';
import { fmod, sumComplement32 } from '../utils/math';
import { isAndroid } from '../utils/os';
import {
    FailToFinishReasonType,
    HubError,
    MetadataProblem,
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
    firmwareInstallPybricks,
    flashFirmware,
} from './actions';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
    firmwareInstallPybricksDialogShow,
} from './installPybricksDialog/actions';

const firmwareZipMap = new Map<HubType, string>([
    [HubType.CityHub, cityHubZip],
    [HubType.TechnicHub, technicHubZip],
    [HubType.MoveHub, moveHubZip],
]);

/**
 * Disconnects the BLE if we are connected and cancels the task (including the
 * parent task).
 */
function* disconnectAndCancel(): SagaGenerator<void> {
    const connection = yield* select((s: RootState) => s.bootloader.connection);

    if (connection === BootloaderConnectionState.Connected) {
        yield* put(disconnect());
    }

    yield* cancel();
}

function* waitForDidRequest(id: number): SagaGenerator<ReturnType<typeof didRequest>> {
    const { requested, failedToRequest } = yield* race({
        requested: take(didRequest.when((a) => a.id === id)),
        failedToRequest: take(didFailToRequest.when((a) => a.id === id)),
    });

    if (failedToRequest) {
        yield* put(
            didFailToFinish(FailToFinishReasonType.BleError, failedToRequest.err),
        );
        yield* disconnectAndCancel();
    }

    defined(requested);

    return requested;
}

/**
 * Waits for a response action, an error response or timeout, whichever comes
 * first.
 * @param pattern The action type to wait for.
 * @param timeout The timeout in milliseconds.
 */
function* waitForResponse<A extends AnyAction>(
    pattern: ActionPattern<A>,
    timeout = 500,
): SagaGenerator<A> {
    const { response, error, disconnected, timedOut } = yield* race({
        response: take(pattern),
        error: take(errorResponse),
        disconnected: take(didDisconnect),
        timedOut: delay(timeout),
    });

    if (timedOut) {
        // istanbul ignore if: this hacks around a hardware/OS issue
        if (pattern === (errorResponse as unknown)) {
            // It has been observed that sometimes this response is not received
            // or gets stuck in the Bluetooth stack until another request is sent.
            // So, we ignore the timeout and continue. If there really was a
            // problem, then the next request should fail anyway.
            console.warn('Timeout waiting for erase response, continuing anyway.');
            return eraseResponse(Result.OK) as unknown as A;
        }

        yield* put(didFailToFinish(FailToFinishReasonType.TimedOut));
        yield* disconnectAndCancel();
    }

    if (error) {
        yield* put(
            didFailToFinish(FailToFinishReasonType.HubError, HubError.UnknownCommand),
        );
        yield* disconnectAndCancel();
    }

    if (disconnected) {
        yield* put(didFailToFinish(FailToFinishReasonType.Disconnected));
        yield* disconnectAndCancel();
    }

    defined(response);

    return response;
}

function* firmwareIterator(data: DataView, maxSize: number): Generator<number> {
    // read each 32-bit word of the firmware
    for (let i = 0; i < data.byteLength; i += 4) {
        yield data.getUint32(i, true);
    }
    // remaining free space in flash will be 0xff after erase
    for (let i = data.byteLength; i < maxSize; i += 4) {
        yield ~0;
    }
}

/**
 * Loads Pybricks firmware from a .zip file.
 *
 * @param data The zip file raw data
 * @param program User program or `undefined` to use main.py from firmware.zip
 */
function* loadFirmware(
    data: ArrayBuffer,
    program: string | undefined,
    hubName: string,
): SagaGenerator<{ firmware: Uint8Array; deviceId: HubType }> {
    const [reader, readerErr] = yield* call(() => maybe(FirmwareReader.load(data)));

    if (readerErr) {
        // istanbul ignore else: unexpected error
        if (readerErr instanceof FirmwareReaderError) {
            yield* put(didFailToFinish(FailToFinishReasonType.ZipError, readerErr));
        } else {
            yield* put(didFailToFinish(FailToFinishReasonType.Unknown, readerErr));
        }
        yield* disconnectAndCancel();
    }

    defined(reader);

    const firmwareBase = yield* call(() => reader.readFirmwareBase());
    const metadata = yield* call(() => reader.readMetadata());

    // if a user program was not given, then use main.py from the frimware.zip
    if (program === undefined) {
        program = yield* call(() => reader.readMainPy());
    }

    if (![5, 6].includes(metadata['mpy-abi-version'])) {
        yield* put(
            didFailToFinish(
                FailToFinishReasonType.BadMetadata,
                'mpy-abi-version',
                MetadataProblem.NotSupported,
            ),
        );
        yield* disconnectAndCancel();
    }

    yield* put(
        compile(program, metadata['mpy-abi-version'], metadata['mpy-cross-options']),
    );
    const { mpy, mpyFail } = yield* race({
        mpy: take(didCompile),
        mpyFail: take(didFailToCompile),
    });

    if (mpyFail) {
        yield* put(didFailToFinish(FailToFinishReasonType.FailedToCompile));
        yield* disconnectAndCancel();
    }

    defined(mpy);

    // compute offset for checksum - must be aligned to 4-byte boundary
    const checksumOffset =
        metadata['user-mpy-offset'] + 4 + mpy.data.length + fmod(-mpy.data.length, 4);

    const firmware = new Uint8Array(checksumOffset + 4);
    const firmwareView = new DataView(firmware.buffer);

    if (firmware.length > metadata['max-firmware-size']) {
        yield* put(didFailToFinish(FailToFinishReasonType.FirmwareSize));
        yield* disconnectAndCancel();
    }

    firmware.set(firmwareBase);
    firmwareView.setUint32(metadata['user-mpy-offset'], mpy.data.length, true);
    firmware.set(mpy.data, metadata['user-mpy-offset'] + 4);

    // if the firmware supports it, we can set a custom hub name
    if (metadata['max-hub-name-size']) {
        // empty string means use default name (don't write over firmware)
        if (hubName) {
            firmware.set(encodeHubName(hubName, metadata), metadata['hub-name-offset']);
        }
    }

    if (metadata['checksum-type'] !== 'sum') {
        yield* put(
            didFailToFinish(
                FailToFinishReasonType.BadMetadata,
                'checksum-type',
                MetadataProblem.NotSupported,
            ),
        );
        yield* disconnectAndCancel();
    }

    const checksum = sumComplement32(
        firmwareIterator(firmwareView, metadata['max-firmware-size']),
    );

    firmwareView.setUint32(checksumOffset, checksum, true);

    return { firmware, deviceId: metadata['device-id'] };
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* handleFlashFirmware(action: ReturnType<typeof flashFirmware>): Generator {
    try {
        let firmware: Uint8Array | undefined = undefined;
        let deviceId: HubType | undefined = undefined;

        let program: string | undefined = undefined;

        if (action.customProgram) {
            yield* put(fileStorageReadFile(action.customProgram));

            const { didRead, didFailToRead } = yield* race({
                didRead: take(
                    fileStorageDidReadFile.when((a) => a.path === action.customProgram),
                ),
                didFailToRead: take(
                    fileStorageDidFailToReadFile.when(
                        (a) => a.path === action.customProgram,
                    ),
                ),
            });

            if (didFailToRead) {
                throw didFailToRead.error;
            }

            defined(didRead);

            program = didRead.contents;
        }

        if (action.data !== null) {
            ({ firmware, deviceId } = yield* loadFirmware(
                action.data,
                program,
                action.hubName,
            ));
        }

        yield* put(connect());
        const connectResult = yield* take([didConnect, didFailToConnect]);

        if (didFailToConnect.matches(connectResult)) {
            yield* put(didFailToFinish(FailToFinishReasonType.FailedToConnect));
            return;
        }

        const nextMessageId = yield* getContext<() => number>('nextMessageId');

        const infoAction = yield* put(infoRequest(nextMessageId()));
        const { info } = yield* all({
            sent: waitForDidRequest(infoAction.id),
            info: waitForResponse(infoResponse),
        });

        if (deviceId !== undefined && info.hubType !== deviceId) {
            yield* put(didFailToFinish(FailToFinishReasonType.DeviceMismatch));
            yield* disconnectAndCancel();
        }

        if (firmware === undefined) {
            const firmwarePath = firmwareZipMap.get(info.hubType);
            if (firmwarePath === undefined) {
                yield* put(didFailToFinish(FailToFinishReasonType.NoFirmware));
                yield* disconnectAndCancel();
            }

            defined(firmwarePath);

            const response = yield* call(() => fetch(firmwarePath));
            if (!response.ok) {
                yield* put(
                    didFailToFinish(FailToFinishReasonType.FailedToFetch, response),
                );
                yield* disconnectAndCancel();
            }

            const data = yield* call(() => response.arrayBuffer());
            ({ firmware, deviceId } = yield* loadFirmware(
                data,
                program,
                action.hubName,
            ));

            if (deviceId !== undefined && info.hubType !== deviceId) {
                yield* put(didFailToFinish(FailToFinishReasonType.DeviceMismatch));
                yield* disconnectAndCancel();
            }
        }

        yield* put(didStart());

        const eraseAction = yield* put(
            eraseRequest(nextMessageId(), deviceId === HubType.CityHub),
        );
        const { erase } = yield* all({
            sent: waitForDidRequest(eraseAction.id),
            erase: waitForResponse(eraseResponse, 5000),
        });
        if (erase.result !== Result.OK) {
            yield* put(
                didFailToFinish(FailToFinishReasonType.HubError, HubError.EraseFailed),
            );
            yield* disconnectAndCancel();
        }

        const initAction = yield* put(initRequest(nextMessageId(), firmware.length));
        const { init } = yield* all({
            sent: waitForDidRequest(initAction.id),
            init: waitForResponse(initResponse),
        });
        if (init.result) {
            yield* put(
                didFailToFinish(FailToFinishReasonType.HubError, HubError.InitFailed),
            );
            yield* disconnectAndCancel();
        }

        // 14 is "safe" size for all hubs and Android
        const maxDataSize =
            (!isAndroid() && MaxProgramFlashSize.get(info.hubType)) || 14;

        let runningChecksum = 0xff;

        for (let count = 1, offset = 0; ; count++) {
            const payload = firmware.slice(offset, offset + maxDataSize);

            runningChecksum = payload.reduce(
                (prev, curr) => prev ^ curr,
                runningChecksum,
            );

            const programAction = yield* put(
                programRequest(
                    nextMessageId(),
                    info.startAddress + offset,
                    payload.buffer,
                ),
            );
            yield* waitForDidRequest(programAction.id);

            yield* put(didProgress(offset / firmware.length));

            // we don't want to request checksum if this is the last packet since
            // the bootloader will send a response to the program request already.
            offset += maxDataSize;
            if (offset >= firmware.length) {
                break;
            }

            // Request checksum every 10 packets to prevent buffer overrun on
            // the hub because of sending too much data at once. The actual
            // number of packets that can be queued in the Bluetooth chip on
            // the hub is not known and could vary by device.
            if (count % 10 === 0) {
                const checksumAction = yield* put(checksumRequest(nextMessageId()));

                const { response } = yield* all({
                    sent: waitForDidRequest(checksumAction.id),
                    response: waitForResponse(checksumResponse, 5000),
                });

                if (response.checksum !== runningChecksum) {
                    // istanbul ignore next
                    if (process.env.NODE_ENV !== 'test') {
                        console.error(
                            `checksum: got ${hex(response.checksum, 2)} expected ${hex(
                                runningChecksum,
                                2,
                            )}`,
                        );
                    }
                    yield* put(
                        didFailToFinish(
                            FailToFinishReasonType.HubError,
                            HubError.ChecksumMismatch,
                        ),
                    );
                    yield* disconnectAndCancel();
                }
            }
        }

        const flash = yield* waitForResponse(programResponse, 5000);

        if (flash.count !== firmware.length) {
            yield* put(
                didFailToFinish(
                    FailToFinishReasonType.HubError,
                    HubError.CountMismatch,
                ),
            );
            yield* disconnectAndCancel();
        }

        if (flash.checksum !== runningChecksum) {
            // istanbul ignore next
            if (process.env.NODE_ENV !== 'test') {
                console.error(
                    `final checksum: got ${hex(flash.checksum, 2)} expected ${hex(
                        runningChecksum,
                        2,
                    )}`,
                );
            }
            yield* put(
                didFailToFinish(
                    FailToFinishReasonType.HubError,
                    HubError.ChecksumMismatch,
                ),
            );
            yield* disconnectAndCancel();
        }

        yield* put(didProgress(1));

        // this will cause the remote device to disconnect and reboot
        const rebootAction = yield* put(rebootRequest(nextMessageId()));
        yield* waitForDidRequest(rebootAction.id);

        yield* put(didFinish());
    } catch (err) {
        yield* put(didFailToFinish(FailToFinishReasonType.Unknown, ensureError(err)));
        yield* disconnectAndCancel();
    }
}

function* handleInstallPybricks(): Generator {
    yield* put(firmwareInstallPybricksDialogShow());
    const { accepted, canceled } = yield* race({
        accepted: take(firmwareInstallPybricksDialogAccept),
        canceled: take(firmwareInstallPybricksDialogCancel),
    });

    if (canceled) {
        return;
    }

    defined(accepted);

    yield* put(
        flashFirmware(accepted.firmwareZip, accepted.customProgram, accepted.hubName),
    );
}

export default function* (): Generator {
    yield* takeEvery(flashFirmware, handleFlashFirmware);
    yield* takeEvery(firmwareInstallPybricks, handleInstallPybricks);
}
