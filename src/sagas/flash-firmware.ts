// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { FirmwareReader, FirmwareReaderError, HubType } from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
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
import { Action } from '../actions';
import {
    FailToFinishReasonType,
    FlashFirmwareActionType,
    FlashFirmwareFlashAction,
    HubError,
    MetadataProblem,
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
} from '../actions/flash-firmware';
import {
    BootloaderChecksumResponseAction,
    BootloaderConnectionAction,
    BootloaderConnectionActionType,
    BootloaderDidRequestAction,
    BootloaderDidRequestType,
    BootloaderEraseResponseAction,
    BootloaderErrorResponseAction,
    BootloaderInfoResponseAction,
    BootloaderInitResponseAction,
    BootloaderProgramResponseAction,
    BootloaderResponseAction,
    BootloaderResponseActionType,
    checksumRequest,
    connect,
    disconnect,
    eraseRequest,
    infoRequest,
    initRequest,
    programRequest,
    rebootRequest,
} from '../actions/lwp3-bootloader';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../actions/mpy';
import { MaxProgramFlashSize, Result } from '../protocols/lwp3-bootloader';
import { RootState } from '../reducers';
import { BootloaderConnectionState } from '../reducers/bootloader';
import { defined, maybe } from '../utils';
import { fmod, sumComplement32 } from '../utils/math';

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

function* waitForDidRequest(id: number): SagaGenerator<BootloaderDidRequestAction> {
    const request = yield* take<BootloaderDidRequestAction>(
        (a: Action) => a.type === BootloaderDidRequestType && a.id === id,
    );
    if (request.err) {
        yield* put(didFailToFinish(FailToFinishReasonType.BleError, request.err));
        yield* disconnectAndCancel();
    }

    return request;
}

/**
 * Waits for a response action, an error response or timeout, whichever comes
 * first.
 * @param type The action type to wait for.
 * @param timeout The timeout in milliseconds.
 */
function* waitForResponse<T extends BootloaderResponseAction>(
    type: BootloaderResponseActionType,
    timeout = 500,
): SagaGenerator<T> {
    const { response, error, disconnected, timedOut } = yield* race({
        response: take<T>(type),
        error: take<BootloaderErrorResponseAction>(BootloaderResponseActionType.Error),
        disconnected: take(BootloaderConnectionActionType.DidDisconnect),
        timedOut: delay(timeout),
    });

    if (timedOut) {
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
): SagaGenerator<{ firmware: Uint8Array; deviceId: HubType; checksum: number }> {
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

    if (metadata['mpy-abi-version'] !== 5) {
        yield* put(
            didFailToFinish(
                FailToFinishReasonType.BadMetadata,
                'mpy-abi-version',
                MetadataProblem.NotSupported,
            ),
        );
        yield* disconnectAndCancel();
    }

    yield* put(compile(program, metadata['mpy-cross-options']));
    const { mpy, mpyFail } = yield* race({
        mpy: take<MpyDidCompileAction>(MpyActionType.DidCompile),
        mpyFail: take<MpyDidFailToCompileAction>(MpyActionType.DidFailToCompile),
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

    return { firmware, deviceId: metadata['device-id'], checksum };
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* flashFirmware(action: FlashFirmwareFlashAction): Generator {
    try {
        let firmware: Uint8Array | undefined = undefined;
        let deviceId: HubType | undefined = undefined;
        let checksum: number | undefined = undefined;

        let program: string | undefined = undefined;

        const flashCurrentProgram = yield* select(
            (s: RootState) => s.settings.flashCurrentProgram,
        );

        if (flashCurrentProgram) {
            const editor = yield* select((s: RootState) => s.editor.current);

            // istanbul ignore if: it is a bug to dispatch this action with no current editor
            if (editor === null) {
                console.error('flashFirmware: No current editor');
                return;
            }

            program = editor.getValue();
        }

        if (action.data !== undefined) {
            ({ firmware, deviceId, checksum } = yield* loadFirmware(
                action.data,
                program,
            ));
        }

        yield* put(connect());
        const connectResult = yield* take<BootloaderConnectionAction>([
            BootloaderConnectionActionType.DidConnect,
            BootloaderConnectionActionType.DidFailToConnect,
        ]);

        if (connectResult.type === BootloaderConnectionActionType.DidFailToConnect) {
            yield* put(didFailToFinish(FailToFinishReasonType.FailedToConnect));
            return;
        }

        const nextMessageId = yield* getContext<() => number>('nextMessageId');

        const infoAction = yield* put(infoRequest(nextMessageId()));
        const { info } = yield* all({
            sent: waitForDidRequest(infoAction.id),
            info: waitForResponse<BootloaderInfoResponseAction>(
                BootloaderResponseActionType.Info,
            ),
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
            ({ firmware, deviceId, checksum } = yield* loadFirmware(data, program));

            if (deviceId !== undefined && info.hubType !== deviceId) {
                yield* put(didFailToFinish(FailToFinishReasonType.DeviceMismatch));
                yield* disconnectAndCancel();
            }
        }

        yield* put(didStart());

        const eraseAction = yield* put(eraseRequest(nextMessageId()));
        const { erase } = yield* all({
            sent: waitForDidRequest(eraseAction.id),
            erase: waitForResponse<BootloaderEraseResponseAction>(
                BootloaderResponseActionType.Erase,
                5000,
            ),
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
            init: waitForResponse<BootloaderInitResponseAction>(
                BootloaderResponseActionType.Init,
            ),
        });
        if (init.result) {
            yield* put(
                didFailToFinish(FailToFinishReasonType.HubError, HubError.InitFailed),
            );
            yield* disconnectAndCancel();
        }

        // 14 is "safe" size for all hubs
        const maxDataSize = MaxProgramFlashSize.get(info.hubType) || 14;

        for (let count = 1, offset = 0; ; count++) {
            const payload = firmware.slice(offset, offset + maxDataSize);
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
                yield* all({
                    sent: waitForDidRequest(checksumAction.id),
                    checksum: waitForResponse<BootloaderChecksumResponseAction>(
                        BootloaderResponseActionType.Checksum,
                        5000,
                    ),
                });
            }
        }

        const flash = yield* waitForResponse<BootloaderProgramResponseAction>(
            BootloaderResponseActionType.Program,
            5000,
        );

        if (flash.count !== firmware.length) {
            yield* put(
                didFailToFinish(
                    FailToFinishReasonType.HubError,
                    HubError.CountMismatch,
                ),
            );
            yield* disconnectAndCancel();
        }

        if (~flash.checksum !== checksum) {
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
        yield* put(didFailToFinish(FailToFinishReasonType.Unknown, err));
        yield* disconnectAndCancel();
    }
}

export default function* (): Generator {
    yield* takeEvery(FlashFirmwareActionType.FlashFirmware, flashFirmware);
}
