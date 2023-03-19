// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors
//
// Manages connection to a Bluetooth Low Energy device running Pybricks firmware.

// TODO: this file needs to be combined with the firmware BLE connection management
// to reduce duplicated code

import { firmwareVersion } from '@pybricks/firmware';
import { Task, buffers, eventChannel } from 'redux-saga';
import { lt, satisfies } from 'semver';
import {
    call,
    cancel,
    delay,
    fork,
    put,
    select,
    spawn,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsDidShowAlert, alertsShowAlert } from '../alerts/actions';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
    bleDIServiceDidReceiveSoftwareRevision,
} from '../ble-device-info-service/actions';
import {
    decodePnpId,
    deviceInformationServiceUUID,
    firmwareRevisionStringUUID,
    pnpIdUUID,
    softwareRevisionStringUUID,
} from '../ble-device-info-service/protocol';
import {
    didFailToWrite as didFailToWriteUart,
    didNotify as didNotifyUart,
    didWrite as didWriteUart,
    write as writeUart,
} from '../ble-nordic-uart-service/actions';
import {
    nordicUartRxCharUUID,
    nordicUartServiceUUID,
    nordicUartTxCharUUID,
} from '../ble-nordic-uart-service/protocol';
import {
    blePybricksServiceDidNotReceiveHubCapabilities,
    blePybricksServiceDidReceiveHubCapabilities,
    didFailToWriteCommand,
    didNotifyEvent,
    didWriteCommand,
    writeCommand,
} from '../ble-pybricks-service/actions';
import {
    pybricksControlEventCharacteristicUUID,
    pybricksHubCapabilitiesCharacteristicUUID,
    pybricksServiceUUID,
} from '../ble-pybricks-service/protocol';
import { firmwareInstallPybricks } from '../firmware/actions';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import { isLinux } from '../utils/os';
import { pythonVersionToSemver } from '../utils/version';
import {
    bleConnectPybricks as bleConnectPybricks,
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDidFailToConnectPybricks,
    bleDisconnectPybricks,
    toggleBluetooth,
} from './actions';
import { BleConnectionState } from './reducers';

const decoder = new TextDecoder();

function* handlePybricksControlValueChanged(data: DataView): Generator {
    yield* put(didNotifyEvent(data));
}

function* handleWriteCommand(
    char: BluetoothRemoteGATTCharacteristic,
    action: ReturnType<typeof writeCommand>,
): Generator {
    try {
        yield* call(() => char.writeValueWithResponse(action.value.buffer));
        yield* put(didWriteCommand(action.id));
    } catch (err) {
        yield* put(didFailToWriteCommand(action.id, ensureError(err)));
    }
}

function* handleUartValueChanged(data: DataView): Generator {
    yield* put(didNotifyUart(data));
}

function* handleWriteUart(
    char: BluetoothRemoteGATTCharacteristic,
    action: ReturnType<typeof writeUart>,
): Generator {
    try {
        yield* call(() => char.writeValueWithoutResponse(action.value.buffer));
        yield* put(didWriteUart(action.id));
    } catch (err) {
        yield* put(didFailToWriteUart(action.id, ensureError(err)));
    }
}

function* handleBleConnectPybricks(): Generator {
    if (navigator.bluetooth === undefined) {
        yield* put(alertsShowAlert('ble', 'noWebBluetooth'));
        yield* put(bleDidFailToConnectPybricks());
        return;
    }

    const available = yield* call(() => navigator.bluetooth.getAvailability());
    if (!available) {
        yield* put(alertsShowAlert('ble', 'bluetoothNotAvailable'));
        yield* put(bleDidFailToConnectPybricks());
        return;
    }

    // spawned tasks that will need to be canceled later
    const tasks = new Array<Task>();

    const defer = new Array<() => void>();

    try {
        const device = yield* call(() =>
            navigator.bluetooth
                .requestDevice({
                    filters: [{ services: [pybricksServiceUUID] }],
                    optionalServices: [
                        pybricksServiceUUID,
                        deviceInformationServiceUUID,
                        nordicUartServiceUUID,
                    ],
                })
                .catch((err) => {
                    if (err instanceof DOMException && err.name === 'NotFoundError') {
                        // this means the user clicked the cancel button in the scan dialog
                        return undefined;
                    }

                    throw err;
                }),
        );

        // TODO: remove debug print
        console.log('device', device);

        if (!device) {
            yield* put(alertsShowAlert('ble', 'noHub'));
            yield* put(bleDidFailToConnectPybricks());

            const { action } = yield* take<
                ReturnType<typeof alertsDidShowAlert<'ble', 'noHub'>>
            >(
                alertsDidShowAlert.when(
                    (a) => a.domain === 'ble' && a.specific === 'noHub',
                ),
            );

            if (action === 'flashFirmware') {
                yield* put(firmwareInstallPybricks());
            }

            return;
        }

        const gatt = device.gatt;

        if (!gatt) {
            yield* put(alertsShowAlert('ble', 'noGatt'));
            yield* put(bleDidFailToConnectPybricks());
            return;
        }

        const disconnectChannel = eventChannel<Event>((emit) => {
            device.addEventListener('gattserverdisconnected', emit);
            return (): void =>
                device.removeEventListener('gattserverdisconnected', emit);
        }, buffers.sliding(1));

        defer.push(() => disconnectChannel.close());

        const timeout = setTimeout(() => {
            // TODO: remove debug print
            console.log('calling disconnect');
            gatt.disconnect();
        }, 10000);

        const server = yield* call(() =>
            gatt.connect().catch((err) => {
                // TODO: remove debug print
                console.error(err);

                // timeout or other connection problem
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return undefined;
                }

                throw err;
            }),
        );

        clearTimeout(timeout);

        // TODO: remove debug print
        console.log(server);

        if (!server) {
            yield* put(alertsShowAlert('ble', 'failedToConnect'));
            yield* put(bleDidFailToConnectPybricks());
            return;
        }

        // TODO: remove debug print
        console.log('server', server);

        defer.push(() => server.disconnect());

        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            // give OS Bluetooth stack some time to settle
            yield* delay(1000);
        }

        const deviceInfoService = yield* call(() =>
            server.getPrimaryService(deviceInformationServiceUUID).catch((err) => {
                if (err instanceof DOMException && err.name === 'NotFoundError') {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!deviceInfoService) {
            yield* put(
                alertsShowAlert('ble', 'missingService', {
                    serviceName: 'Device Information',
                    hubName: device.name || 'Pybricks Hub',
                }),
            );
            yield* put(bleDidFailToConnectPybricks());
            return;
        }

        const firmwareVersionChar = yield* call(() =>
            deviceInfoService.getCharacteristic(firmwareRevisionStringUUID),
        );

        const firmwareRevision = decoder.decode(
            yield* call(() => firmwareVersionChar.readValue()),
        );
        yield* put(bleDIServiceDidReceiveFirmwareRevision(firmwareRevision));

        // notify user if old firmware
        if (
            lt(
                pythonVersionToSemver(firmwareRevision),
                pythonVersionToSemver(firmwareVersion),
            )
        ) {
            yield* put(alertsShowAlert('ble', 'oldFirmware'));

            // initiate flashing firmware if user requested
            const flashIfRequested = function* () {
                const { action } = yield* take<
                    ReturnType<typeof alertsDidShowAlert<'ble', 'oldFirmware'>>
                >(
                    alertsDidShowAlert.when(
                        (a) => a.domain === 'ble' && a.specific === 'oldFirmware',
                    ),
                );

                if (action === 'flashFirmware') {
                    yield* put(firmwareInstallPybricks());
                }
            };

            // have to spawn so that we don't block the task and it still works
            // if parent task ends
            yield* spawn(flashIfRequested);
        }

        const softwareVersionChar = yield* call(() =>
            deviceInfoService.getCharacteristic(softwareRevisionStringUUID),
        );

        const softwareRevision = decoder.decode(
            yield* call(() => softwareVersionChar.readValue()),
        );
        yield* put(bleDIServiceDidReceiveSoftwareRevision(softwareRevision));

        const pnpIdChar = yield* call(() =>
            deviceInfoService.getCharacteristic(pnpIdUUID).catch((err) => {
                if (err instanceof DOMException && err.name === 'NotFoundError') {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!pnpIdChar) {
            // possible with firmware < v3.1.0
            throw new Error('missing PnP ID characteristic');
        }

        const pnpId = decodePnpId(yield* call(() => pnpIdChar.readValue()));
        yield* put(bleDIServiceDidReceivePnPId(pnpId));

        const pybricksService = yield* call(() =>
            server.getPrimaryService(pybricksServiceUUID).catch((err) => {
                if (err instanceof DOMException && err.name === 'NotFoundError') {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!pybricksService) {
            yield* put(
                alertsShowAlert('ble', 'missingService', {
                    serviceName: 'Pybricks',
                    hubName: device.name || 'Pybricks Hub',
                }),
            );
            yield* put(bleDidFailToConnectPybricks());
            return;
        }

        const pybricksControlChar = yield* call(() =>
            pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID),
        );

        const pybricksControlChannel = eventChannel<DataView>((emit) => {
            const listener = (): void => {
                if (!pybricksControlChar.value) {
                    return;
                }
                emit(pybricksControlChar.value);
            };

            pybricksControlChar.addEventListener(
                'characteristicvaluechanged',
                listener,
            );

            return (): void =>
                pybricksControlChar.removeEventListener(
                    'characteristicvaluechanged',
                    listener,
                );
        });

        defer.push(() => pybricksControlChannel.close());
        tasks.push(
            yield* takeEvery(pybricksControlChannel, handlePybricksControlValueChanged),
        );

        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call(() => pybricksControlChar.stopNotifications());
        yield* call(() => pybricksControlChar.startNotifications());

        tasks.push(
            yield* takeEvery(writeCommand, handleWriteCommand, pybricksControlChar),
        );

        // hub capabilities characteristic was introduced in Pybricks Profile v1.2.0
        if (satisfies(softwareRevision, '^1.2.0')) {
            const pybricksHubCapabilitiesChar = yield* call(() =>
                pybricksService.getCharacteristic(
                    pybricksHubCapabilitiesCharacteristicUUID,
                ),
            );

            const hubCapabilitiesValue = yield* call(() =>
                pybricksHubCapabilitiesChar.readValue(),
            );

            const maxWriteSize = hubCapabilitiesValue.getUint16(0, true);
            const flags = hubCapabilitiesValue.getUint32(2, true);
            const maxUserProgramSize = hubCapabilitiesValue.getUint32(6, true);

            yield* put(
                blePybricksServiceDidReceiveHubCapabilities(
                    maxWriteSize,
                    flags,
                    maxUserProgramSize,
                ),
            );
        } else {
            yield* put(
                blePybricksServiceDidNotReceiveHubCapabilities(pnpId, firmwareRevision),
            );
        }

        const uartService = yield* call(() =>
            server.getPrimaryService(nordicUartServiceUUID).catch((err) => {
                if (err instanceof DOMException && err.name === 'NotFoundError') {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!uartService) {
            yield* put(
                alertsShowAlert('ble', 'missingService', {
                    serviceName: 'Nordic UART',
                    hubName: device.name || 'Pybricks Hub',
                }),
            );
            yield* put(bleDidFailToConnectPybricks());
            return;
        }

        const uartRxChar = yield* call(() =>
            uartService.getCharacteristic(nordicUartRxCharUUID),
        );

        const uartTxChar = yield* call(() =>
            uartService.getCharacteristic(nordicUartTxCharUUID),
        );

        const uartTxChannel = eventChannel<DataView>((emitter) => {
            const listener = (): void => {
                if (!uartTxChar.value) {
                    return;
                }
                emitter(uartTxChar.value);
            };
            uartTxChar.addEventListener('characteristicvaluechanged', listener);
            return (): void =>
                uartTxChar.removeEventListener('characteristicvaluechanged', listener);
        });

        defer.push(() => uartTxChannel.close());
        tasks.push(yield* takeEvery(uartTxChannel, handleUartValueChanged));

        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call(() => uartTxChar.stopNotifications());
        yield* call(() => uartTxChar.startNotifications());

        tasks.push(yield* takeEvery(writeUart, handleWriteUart, uartRxChar));

        yield* put(bleDidConnectPybricks(device.id, device.name || ''));

        const handleDisconnectRequest = function* (): Generator {
            yield* take(bleDisconnectPybricks);
            server.disconnect();
        };

        yield* fork(handleDisconnectRequest);

        // wait for disconnection
        yield* take(disconnectChannel);

        // HACK: Disconnection event comes early on Linux, so scanning again
        // can show that the previous connection is still "paired" and trying
        // to select it results in infinite wait. To work around this, we need
        // to wait long enough for BlueZ to actually disconnect the device.
        // https://github.com/pybricks/support/issues/600#issuecomment-1286606624
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test' && isLinux()) {
            yield* delay(5000);
        }

        yield* put(bleDidDisconnectPybricks());
    } catch (err) {
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            // log error so it can still be copied even if alert is closed
            console.error(err);
        }

        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: ensureError(err),
            }),
        );
        yield* put(bleDidFailToConnectPybricks());
    } finally {
        yield* cancel(tasks);

        while (defer.length > 0) {
            defer.pop()?.();
        }
    }
}

function* handleToggleBluetooth(): Generator {
    const connectionState = (yield select(
        (s: RootState) => s.ble.connection,
    )) as BleConnectionState;

    switch (connectionState) {
        case BleConnectionState.Connected:
            yield* put(bleDisconnectPybricks());
            break;
        case BleConnectionState.Disconnected:
            yield* put(bleConnectPybricks());
            break;
    }
}

export default function* (): Generator {
    yield* takeEvery(bleConnectPybricks, handleBleConnectPybricks);
    yield* takeEvery(toggleBluetooth, handleToggleBluetooth);
}
