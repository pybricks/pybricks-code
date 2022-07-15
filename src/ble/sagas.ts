// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Manages connection to a Bluetooth Low Energy device running Pybricks firmware.

// TODO: this file needs to be combined with the firmware BLE connection management
// to reduce duplicated code

import { Task, buffers, eventChannel } from 'redux-saga';
import {
    call,
    cancel,
    delay,
    fork,
    put,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
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
    didFailToWriteCommand,
    didNotifyEvent,
    didWriteCommand,
    writeCommand,
} from '../ble-pybricks-service/actions';
import {
    pybricksControlCharacteristicUUID,
    pybricksServiceUUID,
} from '../ble-pybricks-service/protocol';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    BleDeviceFailToConnectReasonType as Reason,
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
        yield* call(() => char.writeValueWithoutResponse(action.value.buffer));
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
        yield* put(bleDidFailToConnectPybricks({ reason: Reason.NoWebBluetooth }));
        return;
    }

    const available = yield* call(() => navigator.bluetooth.getAvailability());
    if (!available) {
        yield* put(alertsShowAlert('ble', 'bluetoothNotAvailable'));
        yield* put(bleDidFailToConnectPybricks({ reason: Reason.NoBluetooth }));
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
                    if (
                        err instanceof DOMException &&
                        err.code === DOMException.NOT_FOUND_ERR
                    ) {
                        // this means the user clicked the cancel button in the scan dialog
                        return undefined;
                    }

                    throw err;
                }),
        );

        if (!device) {
            yield* put(bleDidFailToConnectPybricks({ reason: Reason.Canceled }));
            return;
        }

        const gatt = device.gatt;

        if (!gatt) {
            yield* put(bleDidFailToConnectPybricks({ reason: Reason.NoGatt }));
            return;
        }

        const disconnectChannel = eventChannel<Event>((emit) => {
            device.addEventListener('gattserverdisconnected', emit);
            return (): void =>
                device.removeEventListener('gattserverdisconnected', emit);
        }, buffers.sliding(1));

        defer.push(() => disconnectChannel.close());

        const server = yield* call(() => gatt.connect());

        defer.push(() => server.disconnect());

        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            // give OS Bluetooth stack some time to settle
            yield* delay(1000);
        }

        const deviceInfoService = yield* call(() =>
            server.getPrimaryService(deviceInformationServiceUUID).catch((err) => {
                if (
                    err instanceof DOMException &&
                    err.code === DOMException.NOT_FOUND_ERR
                ) {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!deviceInfoService) {
            yield* put(
                bleDidFailToConnectPybricks({ reason: Reason.NoDeviceInfoService }),
            );
            return;
        }

        const firmwareVersionChar = yield* call(() =>
            deviceInfoService.getCharacteristic(firmwareRevisionStringUUID),
        );

        const firmwareRevision = decoder.decode(
            yield* call(() => firmwareVersionChar.readValue()),
        );
        yield* put(bleDIServiceDidReceiveFirmwareRevision(firmwareRevision));

        const softwareVersionChar = yield* call(() =>
            deviceInfoService.getCharacteristic(softwareRevisionStringUUID),
        );

        const softwareRevision = decoder.decode(
            yield* call(() => softwareVersionChar.readValue()),
        );
        yield* put(bleDIServiceDidReceiveSoftwareRevision(softwareRevision));

        const pnpIdChar = yield* call(() =>
            deviceInfoService.getCharacteristic(pnpIdUUID).catch((err) => {
                if (
                    err instanceof DOMException &&
                    err.code === DOMException.NOT_FOUND_ERR
                ) {
                    // istanbul ignore if
                    if (process.env.NODE_ENV !== 'test') {
                        console.warn(
                            'PnP ID characteristic requires Pybricks firmware v3.1.0a1 or later',
                        );
                    }

                    return undefined;
                }

                throw err;
            }),
        );

        if (pnpIdChar) {
            const pnpId = decodePnpId(yield* call(() => pnpIdChar.readValue()));
            yield* put(bleDIServiceDidReceivePnPId(pnpId));
        }

        const pybricksService = yield* call(() =>
            server.getPrimaryService(pybricksServiceUUID).catch((err) => {
                if (
                    err instanceof DOMException &&
                    err.code === DOMException.NOT_FOUND_ERR
                ) {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!pybricksService) {
            yield* put(
                bleDidFailToConnectPybricks({
                    reason: Reason.NoPybricksService,
                }),
            );
            return;
        }

        const pybricksControlChar = yield* call(() =>
            pybricksService.getCharacteristic(pybricksControlCharacteristicUUID),
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

        const uartService = yield* call(() =>
            server.getPrimaryService(nordicUartServiceUUID).catch((err) => {
                if (
                    err instanceof DOMException &&
                    err.code === DOMException.NOT_FOUND_ERR
                ) {
                    return undefined;
                }

                throw err;
            }),
        );

        if (!uartService) {
            yield* put(
                bleDidFailToConnectPybricks({
                    reason: Reason.NoPybricksService,
                }),
            );
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

        yield* put(bleDidDisconnectPybricks());
    } catch (err) {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: ensureError(err),
            }),
        );
        yield* put(
            bleDidFailToConnectPybricks({
                reason: Reason.Unknown,
                err: ensureError(err),
            }),
        );
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
