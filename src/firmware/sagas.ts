// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2025 The Pybricks Authors

import {
    FirmwareReader,
    FirmwareReaderError,
    HubType,
    encodeHubName,
    metadataIsV100,
    metadataIsV110,
} from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import { WebDFU } from 'dfu';
import { AnyAction } from 'redux';
import { eventChannel } from 'redux-saga';
import { ActionPattern } from 'redux-saga/effects';
import {
    SagaGenerator,
    all,
    call,
    cancel,
    delay,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import {
    alertsDidShowAlert,
    alertsHideAlert,
    alertsShowAlert,
} from '../alerts/actions';
import { Hub } from '../components/hubPicker';
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
import { LegoUsbProductId, legoUsbVendorId } from '../usb';
import { assert, defined, ensureError, hex, maybe } from '../utils';
import { crc32, fmod, sumComplement32 } from '../utils/math';
import {
    EV3OfficialFirmwareVersion,
    FailToFinishReasonType,
    HubError,
    MetadataProblem,
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
    firmwareDidFailToFlashEV3,
    firmwareDidFailToFlashUsbDfu,
    firmwareDidFailToRestoreOfficialDfu,
    firmwareDidFailToRestoreOfficialEV3,
    firmwareDidFlashEV3,
    firmwareDidFlashUsbDfu,
    firmwareDidReceiveEV3Reply,
    firmwareDidRestoreOfficialDfu,
    firmwareDidRestoreOfficialEV3,
    firmwareFlashEV3,
    firmwareFlashUsbDfu,
    firmwareInstallPybricks,
    firmwareRestoreOfficialDfu,
    firmwareRestoreOfficialEV3,
    flashFirmware,
} from './actions';
import { firmwareDfuWindowsDriverInstallDialogDialogShow } from './dfuWindowsDriverInstallDialog/actions';
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

const firmwareBleProgressToastId = 'firmware.ble.progress';

/**
 * Disconnects the BLE if we are connected and cancels the task (including the
 * parent task).
 */
function* disconnectAndCancel(): SagaGenerator<void> {
    yield* put(alertsHideAlert(firmwareBleProgressToastId));

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
            didFailToFinish(FailToFinishReasonType.BleError, failedToRequest.error),
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
 * @param hubName Optional custom name for the hub.
 */
function* loadFirmware(
    data: ArrayBuffer,
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

        // FIXME: we should return error/throw instead
        yield* disconnectAndCancel();

        // istanbul ignore next: needed for typescript flow
        throw new Error('unreachable');
    }

    defined(reader);

    const firmwareBase = yield* call(() => reader.readFirmwareBase());
    const metadata = yield* call(() => reader.readMetadata());

    // v1.x allows appending main.py to firmware, later versions do not
    if (metadataIsV100(metadata) || metadataIsV110(metadata)) {
        const program = (yield* call(() => reader.readMainPy())) ?? '';

        if (![5, 6].includes(metadata['mpy-abi-version'])) {
            yield* put(
                didFailToFinish(
                    FailToFinishReasonType.BadMetadata,
                    'mpy-abi-version',
                    MetadataProblem.NotSupported,
                ),
            );

            // FIXME: we should return error/throw instead
            yield* disconnectAndCancel();

            // istanbul ignore next: needed for typescript flow
            throw new Error('unreachable');
        }

        yield* put(
            compile(
                program,
                metadata['mpy-abi-version'],
                metadata['mpy-cross-options'],
            ),
        );
        const { mpy, mpyFail } = yield* race({
            mpy: take(didCompile),
            mpyFail: take(didFailToCompile),
        });

        if (mpyFail) {
            // FIXME: we should return error/throw instead
            yield* put(didFailToFinish(FailToFinishReasonType.FailedToCompile));
            yield* disconnectAndCancel();

            // istanbul ignore next: needed for typescript flow
            throw new Error('unreachable');
        }

        defined(mpy);

        // compute offset for checksum - must be aligned to 4-byte boundary
        const checksumOffset =
            metadata['user-mpy-offset'] +
            4 +
            mpy.data.length +
            fmod(-mpy.data.length, 4);

        const firmware = new Uint8Array(checksumOffset + 4);
        const firmwareView = new DataView(firmware.buffer);

        if (firmware.length > metadata['max-firmware-size']) {
            // FIXME: we should return error/throw instead
            yield* put(didFailToFinish(FailToFinishReasonType.FirmwareSize));
            yield* disconnectAndCancel();

            // istanbul ignore next: needed for typescript flow
            throw new Error('unreachable');
        }

        firmware.set(firmwareBase);
        firmwareView.setUint32(metadata['user-mpy-offset'], mpy.data.length, true);
        firmware.set(mpy.data, metadata['user-mpy-offset'] + 4);

        // if the firmware supports it, we can set a custom hub name
        if (!metadataIsV100(metadata)) {
            // empty string means use default name (don't write over firmware)
            if (hubName) {
                firmware.set(
                    encodeHubName(hubName, metadata),
                    metadata['hub-name-offset'],
                );
            }
        }

        const checksum = (function () {
            switch (metadata['checksum-type']) {
                case 'sum':
                    return sumComplement32(
                        firmwareIterator(firmwareView, metadata['max-firmware-size']),
                    );
                case 'crc32':
                    return crc32(
                        firmwareIterator(firmwareView, metadata['max-firmware-size']),
                    );
                default:
                    return undefined;
            }
        })();

        if (checksum === undefined) {
            // FIXME: we should return error/throw instead
            yield* put(
                didFailToFinish(
                    FailToFinishReasonType.BadMetadata,
                    'checksum-type',
                    MetadataProblem.NotSupported,
                ),
            );
            yield* disconnectAndCancel();

            // istanbul ignore next: needed for typescript flow
            throw new Error('unreachable');
        }

        firmwareView.setUint32(checksumOffset, checksum, true);

        return { firmware, deviceId: metadata['device-id'] };
    }

    const firmware = new Uint8Array(firmwareBase.length + 4);
    const firmwareView = new DataView(firmware.buffer);

    firmware.set(firmwareBase);

    // empty string means use default name (don't write over firmware)
    if (hubName) {
        firmware.set(encodeHubName(hubName, metadata), metadata['hub-name-offset']);
    }

    const checksum = (function () {
        switch (metadata['checksum-type']) {
            case 'sum':
                return sumComplement32(
                    firmwareIterator(firmwareView, metadata['checksum-size']),
                );
            case 'crc32':
                return crc32(firmwareIterator(firmwareView, metadata['checksum-size']));
            default:
                return undefined;
        }
    })();

    if (checksum === undefined) {
        // FIXME: we should return error/throw instead
        yield* put(
            didFailToFinish(
                FailToFinishReasonType.BadMetadata,
                'checksum-type',
                MetadataProblem.NotSupported,
            ),
        );
        yield* disconnectAndCancel();

        // istanbul ignore next: needed for typescript flow
        throw new Error('unreachable');
    }

    firmwareView.setUint32(firmwareBase.length, checksum, true);

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

        if (action.data !== null) {
            ({ firmware, deviceId } = yield* loadFirmware(action.data, action.hubName));
        }

        yield* put(connect());
        const connectResult = yield* take([didConnect, didFailToConnect]);

        if (didFailToConnect.matches(connectResult)) {
            yield* put(didFailToFinish(FailToFinishReasonType.FailedToConnect));
            return;
        }

        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            // give OS Bluetooth stack some time to settle
            yield* delay(1000);
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
            ({ firmware, deviceId } = yield* loadFirmware(data, action.hubName));

            if (deviceId !== undefined && info.hubType !== deviceId) {
                yield* put(didFailToFinish(FailToFinishReasonType.DeviceMismatch));
                yield* disconnectAndCancel();
            }
        }

        yield* put(didStart());

        yield* put(
            alertsShowAlert(
                'firmware',
                'flashProgress',
                {
                    action: 'erase',
                    progress: undefined,
                },
                firmwareBleProgressToastId,
                true,
            ),
        );

        yield* put(alertsShowAlert('firmware', 'releaseButton'));

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

        // 14 is "safe" size for all hubs
        const maxDataSize = MaxProgramFlashSize.get(info.hubType) || 14;

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

            yield* put(
                alertsShowAlert(
                    'firmware',
                    'flashProgress',
                    {
                        action: 'flash',
                        progress: offset / firmware.length,
                    },
                    firmwareBleProgressToastId,
                    true,
                ),
            );

            // we don't want to request checksum if this is the last packet since
            // the bootloader will send a response to the program request already.
            offset += maxDataSize;
            if (offset >= firmware.length) {
                break;
            }

            // Request checksum every 8 packets to prevent buffer overrun on
            // the hub because of sending too much data at once. The actual
            // number of packets that can be queued in the Bluetooth chip on
            // the hub is not known and could vary by device.
            if (count % 8 === 0) {
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

        yield* put(
            alertsShowAlert(
                'firmware',
                'flashProgress',
                {
                    action: 'flash',
                    progress: 1,
                },
                firmwareBleProgressToastId,
                true,
            ),
        );

        // this will cause the remote device to disconnect and reboot
        const rebootAction = yield* put(rebootRequest(nextMessageId()));
        yield* waitForDidRequest(rebootAction.id);

        yield* put(didFinish());
    } catch (err) {
        yield* put(didFailToFinish(FailToFinishReasonType.Unknown, ensureError(err)));
        yield* disconnectAndCancel();
    }
}

// currently all hubs use the same start address
const dfuFirmwareStartAddress = 0x08008000;

const firmwareDfuProgressToastId = 'firmware.dfu.progress';

function* handleDfuEraseProcess(event: {
    bytesSent: number;
    expectedSize: number;
}): Generator {
    yield* put(
        alertsShowAlert(
            'firmware',
            'flashProgress',
            {
                action: 'erase',
                progress: event.bytesSent / event.expectedSize,
            },
            firmwareDfuProgressToastId,
            true,
        ),
    );
}

function* handleDfuWriteProcess(event: {
    bytesSent: number;
    expectedSize: number;
}): Generator {
    yield* put(
        alertsShowAlert(
            'firmware',
            'flashProgress',
            {
                action: 'flash',
                progress: event.bytesSent / event.expectedSize,
            },
            firmwareDfuProgressToastId,
            true,
        ),
    );
}

function getUsbDeviceFiltersForHub(hubType: HubType): USBDeviceFilter[] {
    switch (hubType) {
        case HubType.PrimeHub:
            return [
                {
                    vendorId: legoUsbVendorId,
                    productId: LegoUsbProductId.SpikePrimeBootloader,
                },
                {
                    vendorId: legoUsbVendorId,
                    productId: LegoUsbProductId.MindstormsRobotInventorBootloader,
                },
            ];
        case HubType.EssentialHub:
            return [
                {
                    vendorId: legoUsbVendorId,
                    productId: LegoUsbProductId.SpikeEssentialBootloader,
                },
            ];
        default:
            throw new Error(`unsupported hub type: ${hubType}`);
    }
}

function* handleFlashUsbDfu(action: ReturnType<typeof firmwareFlashUsbDfu>): Generator {
    const defer = new Array<() => void>();

    try {
        // not all web browsers support WebUSB
        if (!navigator.usb) {
            yield* put(alertsShowAlert('firmware', 'noWebUsb'));
            yield* put(firmwareDidFailToFlashUsbDfu());
            return;
        }

        const device = yield* call(() =>
            navigator.usb
                .requestDevice({
                    filters: getUsbDeviceFiltersForHub(action.hubType),
                })
                .catch((err) => {
                    if (err instanceof DOMException && err.name === 'NotFoundError') {
                        // user clicked cancel button
                        return undefined;
                    }

                    throw err;
                }),
        );

        if (!device) {
            yield* put(alertsShowAlert('firmware', 'noDfuHub'));
            yield* put(firmwareDidFailToFlashUsbDfu());

            const { action } = yield* take<
                ReturnType<typeof alertsDidShowAlert<'firmware', 'noDfuHub'>>
            >(
                alertsDidShowAlert.when(
                    (a) => a.domain === 'firmware' && a.specific === 'noDfuHub',
                ),
            );

            if (action === 'installWindowsDriver') {
                yield* put(firmwareDfuWindowsDriverInstallDialogDialogShow());
            }

            return;
        }

        const dfu = new WebDFU(
            device,
            // forceInterfacesName is needed to get the flash layout map
            { forceInterfacesName: true },
            {
                // NB: info and progress are never called in dfu v0.1.5
                info: console.debug,
                warning: console.warn,
                progress: console.debug,
            },
        );

        yield* call(() => dfu.init());

        // we want the interface with alt=0
        const ifaceIndex = dfu.interfaces.findIndex(
            (i) => i.alternate.alternateSetting === 0,
        );

        if (ifaceIndex === -1) {
            yield* put(alertsShowAlert('firmware', 'noDfuInterface'));
            yield* put(firmwareDidFailToFlashUsbDfu());
            return;
        }

        yield* call(() => dfu.connect(ifaceIndex));

        defer.push(() =>
            dfu.close().catch((err) => {
                if (err instanceof DOMException && err.name === 'NetworkError') {
                    // device was disconnected
                    return;
                }

                // not expected
                console.error(err);
            }),
        );

        dfu.dfuseStartAddress = dfuFirmwareStartAddress;
        const writeProc = dfu.write(1024, action.firmware, true);

        const eraseProcessChan = eventChannel<{
            bytesSent: number;
            expectedSize: number;
        }>((emit) => {
            return writeProc.events.on('erase/process', (bytesSent, expectedSize) =>
                emit({ bytesSent, expectedSize }),
            );
        });

        defer.push(() => eraseProcessChan.close());

        yield* takeEvery(eraseProcessChan, handleDfuEraseProcess);

        const writeProcessChan = eventChannel<{
            bytesSent: number;
            expectedSize: number;
        }>((emit) => {
            return writeProc.events.on('write/process', (bytesSent, expectedSize) =>
                emit({ bytesSent, expectedSize }),
            );
        });

        defer.push(() => writeProcessChan.close());

        yield* takeEvery(writeProcessChan, handleDfuWriteProcess);

        const endChan = eventChannel<boolean>((emit) => {
            // can't emit null or undefined, so have to emit something
            return writeProc.events.on('end', () => emit(true));
        });

        defer.push(() => endChan.close());

        const errorChan = eventChannel((emit) => {
            return writeProc.events.on('error', emit);
        });

        defer.push(() => errorChan.close());

        const { error } = yield* (function* () {
            // HACK: Somehow an error during the write phase can cause the
            // race generator to throw instead of returning the error.
            // So we catch the error and return it as if errorChan won the
            // race.
            try {
                return yield* race({
                    end: take(endChan),
                    error: take(errorChan),
                });
            } catch (err) {
                return { error: err };
            }
        })();

        // errors can happen, e.g. if the USB cable is disconnected while
        // flashing the firmware
        if (error) {
            // istanbul ignore if
            if (process.env.NODE_ENV !== 'test') {
                console.error(error);
            }

            yield* put(alertsHideAlert(firmwareDfuProgressToastId));
            yield* put(firmwareDidFailToFlashUsbDfu());

            yield* put(alertsShowAlert('firmware', 'dfuError'));

            const { action: alertAction } = yield* take<
                ReturnType<typeof alertsDidShowAlert<'firmware', 'dfuError'>>
            >(
                alertsDidShowAlert.when(
                    (a) => a.domain === 'firmware' && a.specific === 'dfuError',
                ),
            );

            if (alertAction === 'tryAgain') {
                // queue the action that triggered this saga to retry
                yield* put(action);
            }

            return;
        }

        yield* put(firmwareDidFlashUsbDfu());
    } catch (err) {
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }

        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', { error: ensureError(err) }),
        );

        yield* put(firmwareDidFailToFlashUsbDfu());
    } finally {
        while (defer.length !== 0) {
            defer.pop()?.();
        }
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

    switch (accepted.flashMethod) {
        case 'ble-lwp3-bootloader':
            yield* put(flashFirmware(accepted.firmwareZip, accepted.hubName));
            break;
        case 'usb-lego-dfu':
            try {
                const { firmware, deviceId } = yield* loadFirmware(
                    accepted.firmwareZip,
                    accepted.hubName,
                );

                yield* put(firmwareFlashUsbDfu(firmware, deviceId));
            } catch (err) {
                // istanbul ignore if
                if (process.env.NODE_ENV !== 'test') {
                    console.error(err);
                }

                yield* put(
                    alertsShowAlert('alerts', 'unexpectedError', {
                        error: ensureError(err),
                    }),
                );
            }
            break;
        case 'usb-ev3':
            // TODO: implement flashing via EV3 USB
            console.error('Flashing via EV3 USB is not implemented yet');
            break;
    }
}

function getUrlForHubType(hub: Hub): URL {
    switch (hub) {
        case Hub.Prime:
        case Hub.Inventor:
            return new URL('./assets/prime-v1.3.00.0000-e8c274a.bin', import.meta.url);
        case Hub.Essential:
            return new URL(
                './assets/essential-v1.0.00.0071-191f3ad.bin',
                import.meta.url,
            );
        default:
            throw new Error(`unsupported hub: ${hub}`);
    }
}

function getHubTypeForHub(hub: Hub): HubType {
    switch (hub) {
        case Hub.Prime:
        case Hub.Inventor:
            return HubType.PrimeHub;
        case Hub.Essential:
            return HubType.EssentialHub;
        default:
            throw new Error(`unsupported hub: ${hub}`);
    }
}

function* handleRestoreOfficialDfu(
    action: ReturnType<typeof firmwareRestoreOfficialDfu>,
): Generator {
    try {
        const url = getUrlForHubType(action.hub);

        const response = yield* call(() => fetch(url));

        if (!response.ok) {
            // TODO: replace with proper alert
            // istanbul ignore if
            if (process.env.NODE_ENV !== 'test') {
                console.error(response);
            }
            throw new Error('failed to fetch');
        }

        const firmwareBlob = yield* call(() => response.blob());
        const firmware = yield* call(() => firmwareBlob.arrayBuffer());

        yield* put(firmwareFlashUsbDfu(firmware, getHubTypeForHub(action.hub)));

        const { didFailToFlash } = yield* race({
            didFlash: take(firmwareDidFlashUsbDfu),
            didFailToFlash: take(firmwareDidFailToFlashUsbDfu),
        });

        if (didFailToFlash) {
            yield* put(firmwareDidFailToRestoreOfficialDfu());
            return;
        }

        yield* put(firmwareDidRestoreOfficialDfu());
    } catch (err) {
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }

        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', { error: ensureError(err) }),
        );
        yield* put(firmwareDidFailToRestoreOfficialDfu());
    }
}

function* handleFlashEV3(action: ReturnType<typeof firmwareFlashEV3>): Generator {
    if (navigator.hid === undefined) {
        yield* put(alertsShowAlert('firmware', 'noWebHid'));
        yield* put(firmwareDidFailToFlashEV3());
        return;
    }

    const [hidDevices, hidDevicesError] = yield* call(() =>
        maybe(
            navigator.hid.requestDevice({
                filters: [
                    {
                        vendorId: legoUsbVendorId,
                        productId: LegoUsbProductId.Ev3Bootloader,
                    },
                ],
            }),
        ),
    );

    if (hidDevicesError) {
        // TODO: show info message with tips on how to get EV3 into bootloader mode
        console.error(hidDevicesError);
        yield* put(firmwareDidFailToFlashEV3());
        return;
    }

    defined(hidDevices);

    if (hidDevices.length === 0) {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: new Error('no EV3 HID devices found'),
            }),
        );
        yield* put(firmwareDidFailToFlashEV3());
        return;
    }

    // Only flash one device.
    const hidDevice = hidDevices[0];

    const exitStack: Array<() => Promise<void>> = [];
    function* cleanup() {
        for (const func of exitStack.reverse()) {
            yield* call(() => func());
        }
    }

    const [, openError] = yield* call(() => maybe(hidDevice.open()));
    if (openError) {
        console.error(openError);
        yield* put(alertsShowAlert('alerts', 'unexpectedError', { error: openError }));
        yield* put(firmwareDidFailToFlashEV3());
        yield* cleanup();
        return;
    }

    exitStack.push(() => hidDevice.close());

    const inputChannel = eventChannel<HIDInputReportEvent>((emit) => {
        hidDevice.addEventListener('inputreport', emit);
        return () => hidDevice.removeEventListener('inputreport', emit);
    });
    exitStack.push(async () => inputChannel.close());

    function* readInputReports(): SagaGenerator<void> {
        for (;;) {
            const event = yield* take(inputChannel);
            if (event.data.byteLength === 0) {
                continue; // ignore empty reports
            }

            const length = event.data.getInt16(0, true);
            const replyNumber = event.data.getInt16(2, true);
            const messageType = event.data.getUint8(4);
            const replyCommand = event.data.getUint8(5);
            const status = event.data.getUint8(6);
            const payload = event.data.buffer.slice(7, 7 + length + 2);

            console.debug(
                `EV3 reply: length=${length}, replyNumber=${replyNumber}, messageType=${messageType}, replyCommand=${replyCommand}, status=${status}, payload=${payload}`,
            );

            yield* put(
                firmwareDidReceiveEV3Reply(
                    length,
                    replyNumber,
                    messageType,
                    replyCommand,
                    status,
                    payload,
                ),
            );
        }
    }

    const readInputReportsTask = yield* fork(readInputReports);
    exitStack.push(async () => readInputReportsTask.cancel());

    function* sendCommand(
        command: number,
        payload?: Uint8Array,
    ): SagaGenerator<[DataView | undefined, Error | undefined]> {
        console.debug(`EV3 send: command=${command}, payload=${payload}`);

        const dataBuffer = new Uint8Array((payload?.byteLength ?? 0) + 6);
        const data = new DataView(dataBuffer.buffer);

        data.setInt16(0, (payload?.byteLength ?? 0) + 4, true);
        data.setInt16(2, 0, true); // TODO: reply number
        data.setUint8(4, 0x01); // system command w/ reply
        data.setUint8(5, command);
        if (payload) {
            dataBuffer.set(payload, 6);
        }

        const [, sendError] = yield* call(() => maybe(hidDevice.sendReport(0, data)));

        if (sendError) {
            return [undefined, sendError];
        }

        const { reply, timeout } = yield* race({
            reply: take(firmwareDidReceiveEV3Reply),
            timeout: delay(5000),
        });
        if (timeout) {
            return [undefined, new Error('Timeout waiting for EV3 reply')];
        }

        defined(reply);

        if (reply.replyCommand !== command) {
            return [
                undefined,
                new Error(
                    `EV3 reply command mismatch: expected ${command}, got ${reply.replyCommand}`,
                ),
            ];
        }

        if (reply.status !== 0) {
            return [
                undefined,
                new Error(
                    `EV3 reply status error: ${reply.status} for command ${command}`,
                ),
            ];
        }

        return [new DataView(reply.payload), undefined];
    }

    const [version, versionError] = yield* sendCommand(0xf6); // get version

    if (versionError) {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: ensureError(versionError),
            }),
        );
        yield* put(firmwareDidFailToFlashEV3());
        yield* cleanup();
        return;
    }

    defined(version);

    console.debug(
        `EV3 bootloader version: ${version.getUint32(
            0,
            true,
        )}, HW version: ${version.getUint32(4, true)}`,
    );

    // FIXME: should be called much earlier.
    yield* put(didStart());

    const sectorSize = 64 * 1024; // flash memory sector size
    const maxPayloadSize = 1018; // maximum payload size for EV3 commands

    for (let i = 0; i < action.firmware.byteLength; i += sectorSize) {
        const sectorData = action.firmware.slice(i, i + sectorSize);
        assert(sectorData.byteLength <= sectorSize, 'sector data too large');

        const erasePayload = new DataView(new ArrayBuffer(8));
        erasePayload.setUint32(0, i, true);
        erasePayload.setUint32(4, sectorData.byteLength, true);
        const [, eraseError] = yield* sendCommand(
            0xf0,
            new Uint8Array(erasePayload.buffer),
        );

        if (eraseError) {
            yield* put(
                alertsShowAlert('alerts', 'unexpectedError', {
                    error: eraseError,
                }),
            );
            // FIXME: should have a better error reason
            yield* put(didFailToFinish(FailToFinishReasonType.Unknown));
            yield* put(firmwareDidFailToFlashEV3());
            yield* cleanup();
            return;
        }

        for (let j = 0; j < sectorData.byteLength; j += maxPayloadSize) {
            const payload = sectorData.slice(j, j + maxPayloadSize);

            const [, sendError] = yield* sendCommand(0xf2, new Uint8Array(payload));
            if (sendError) {
                yield* put(
                    alertsShowAlert('alerts', 'unexpectedError', {
                        error: sendError,
                    }),
                );
                // FIXME: should have a better error reason
                yield* put(didFailToFinish(FailToFinishReasonType.Unknown));
                yield* put(firmwareDidFailToFlashEV3());
                yield* cleanup();
                return;
            }
        }

        yield* put(
            didProgress((i + sectorData.byteLength) / action.firmware.byteLength),
        );

        yield* put(
            alertsShowAlert(
                'firmware',
                'flashProgress',
                {
                    action: 'flash',
                    progress: (i + sectorData.byteLength) / action.firmware.byteLength,
                },
                firmwareBleProgressToastId,
                true,
            ),
        );
    }

    yield* put(
        alertsShowAlert(
            'firmware',
            'flashProgress',
            {
                action: 'flash',
                progress: 1,
            },
            firmwareBleProgressToastId,
            true,
        ),
    );

    const [, rebootError] = yield* sendCommand(0xf4); // start app
    if (rebootError) {
        // FIXME: should have a better error reason
        yield* put(didFailToFinish(FailToFinishReasonType.Unknown));
        yield* put(firmwareDidFailToFlashEV3());
        yield* cleanup();
        return;
    }

    yield* put(didFinish());

    yield* cleanup();

    yield* put(firmwareDidFlashEV3());
}

function getUrlForEV3FirmwareVersion(version: EV3OfficialFirmwareVersion): URL {
    switch (version) {
        case EV3OfficialFirmwareVersion.home:
            return new URL('./assets/EV3_Firmware_V1.09H.bin', import.meta.url);
        case EV3OfficialFirmwareVersion.education:
            return new URL('./assets/ev3_firmware_v1.09e.bin', import.meta.url);
        case EV3OfficialFirmwareVersion.makecode:
            return new URL('./assets/ev3-image-1.10e.bin', import.meta.url);
        default:
            throw new Error(`unsupported EV3 firmware version: ${version}`);
    }
}

function* handleRestoreOfficialEV3(
    action: ReturnType<typeof firmwareRestoreOfficialEV3>,
): Generator {
    try {
        const url = getUrlForEV3FirmwareVersion(action.version);

        const response = yield* call(() => fetch(url));

        if (!response.ok) {
            // TODO: replace with proper alert
            // istanbul ignore if
            if (process.env.NODE_ENV !== 'test') {
                console.error(response);
            }
            throw new Error('failed to fetch');
        }

        const firmwareBlob = yield* call(() => response.blob());
        const firmware = yield* call(() => firmwareBlob.arrayBuffer());

        yield* put(firmwareFlashEV3(firmware));

        const { didFailToFlash } = yield* race({
            didFlash: take(firmwareDidFlashEV3),
            didFailToFlash: take(firmwareDidFailToFlashEV3),
        });

        if (didFailToFlash) {
            yield* put(firmwareDidFailToRestoreOfficialEV3());
            return;
        }

        yield* put(firmwareDidRestoreOfficialEV3());
    } catch (err) {
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }

        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', { error: ensureError(err) }),
        );
        yield* put(firmwareDidFailToRestoreOfficialEV3());
    }
}

export default function* (): Generator {
    yield* takeEvery(flashFirmware, handleFlashFirmware);
    yield* takeEvery(firmwareFlashUsbDfu, handleFlashUsbDfu);
    yield* takeEvery(firmwareInstallPybricks, handleInstallPybricks);
    yield* takeEvery(firmwareRestoreOfficialDfu, handleRestoreOfficialDfu);
    yield* takeEvery(firmwareFlashEV3, handleFlashEV3);
    yield* takeEvery(firmwareRestoreOfficialEV3, handleRestoreOfficialEV3);
}
