// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Manages connection to a Bluetooth Low Energy device running Pybricks firmware.

// TODO: this file needs to be combined with the firmware BLE connection management
// to reduce duplicated code

import { END, Task, eventChannel } from 'redux-saga';
import {
    call,
    cancel,
    put,
    select,
    takeEvery,
    takeMaybe,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
    bleDIServiceDidReceiveSoftwareRevision,
} from '../ble-device-info-service/actions';
import {
    decodePnpId,
    serviceUUID as deviceInfoServiceUUID,
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
    RxCharUUID as uartRxCharUUID,
    ServiceUUID as uartServiceUUID,
    TxCharUUID as uartTxCharUUID,
} from '../ble-nordic-uart-service/protocol';
import {
    didFailToWriteCommand,
    didNotifyEvent,
    didWriteCommand,
    writeCommand,
} from '../ble-pybricks-service/actions';
import {
    ControlCharacteristicUUID as pybricksCommandCharacteristicUUID,
    ServiceUUID as pybricksServiceUUID,
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

function handleDisconnect(server: BluetoothRemoteGATTServer): void {
    server.disconnect();
}

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

    let device: BluetoothDevice;
    try {
        device = yield* call(() =>
            navigator.bluetooth.requestDevice({
                filters: [{ services: [pybricksServiceUUID] }],
                optionalServices: [
                    pybricksServiceUUID,
                    deviceInfoServiceUUID,
                    uartServiceUUID,
                ],
            }),
        );
    } catch (err) {
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // this can happen if the use cancels the dialog
            yield* put(bleDidFailToConnectPybricks({ reason: Reason.Canceled }));
        } else {
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
        }
        return;
    }

    if (device.gatt === undefined) {
        yield* put(bleDidFailToConnectPybricks({ reason: Reason.NoGatt }));
        return;
    }

    const disconnectChannel = eventChannel((emitter) => {
        const listener = (): void => emitter(END);
        device.addEventListener('gattserverdisconnected', listener);
        return (): void =>
            device.removeEventListener('gattserverdisconnected', listener);
    });

    let server: BluetoothRemoteGATTServer;
    try {
        server = yield* call([device.gatt, 'connect']);
    } catch (err) {
        disconnectChannel.close();
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
        return;
    }

    yield* takeEvery(bleDisconnectPybricks, handleDisconnect, server);

    let deviceInfoService: BluetoothRemoteGATTService;
    try {
        deviceInfoService = yield* call(
            [server, 'getPrimaryService'],
            deviceInfoServiceUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            yield* put(
                bleDidFailToConnectPybricks({ reason: Reason.NoDeviceInfoService }),
            );
        } else {
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
        }
        return;
    }

    let firmwareVersionChar: BluetoothRemoteGATTCharacteristic;
    try {
        firmwareVersionChar = yield* call(
            [deviceInfoService, 'getCharacteristic'],
            firmwareRevisionStringUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    try {
        const version = decoder.decode(yield* call([firmwareVersionChar, 'readValue']));
        yield* put(bleDIServiceDidReceiveFirmwareRevision(version));
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    let softwareVersionChar: BluetoothRemoteGATTCharacteristic;
    try {
        softwareVersionChar = yield* call(
            [deviceInfoService, 'getCharacteristic'],
            softwareRevisionStringUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    try {
        const version = decoder.decode(yield* call([softwareVersionChar, 'readValue']));
        yield* put(bleDIServiceDidReceiveSoftwareRevision(version));
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    let pnpIdChar: BluetoothRemoteGATTCharacteristic | undefined = undefined;
    try {
        pnpIdChar = yield* call([deviceInfoService, 'getCharacteristic'], pnpIdUUID);
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.warn(
                'PnP ID characteristic requires Pybricks firmware v3.1.0a1 or later',
            );
        }
    }

    if (pnpIdChar) {
        try {
            const pnpId = decodePnpId(yield* call([pnpIdChar, 'readValue']));
            yield* put(bleDIServiceDidReceivePnPId(pnpId));
        } catch (err) {
            server.disconnect();
            yield* takeMaybe(disconnectChannel);
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
            return;
        }
    }

    let pybricksService: BluetoothRemoteGATTService;
    try {
        pybricksService = yield* call(
            [server, 'getPrimaryService'],
            pybricksServiceUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            yield* put(
                bleDidFailToConnectPybricks({ reason: Reason.NoPybricksService }),
            );
        } else {
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
        }
        return;
    }

    let pybricksControlChar: BluetoothRemoteGATTCharacteristic;
    try {
        pybricksControlChar = yield* call(
            [pybricksService, 'getCharacteristic'],
            pybricksCommandCharacteristicUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    const pybricksControlChannel = eventChannel<DataView>((emitter) => {
        const listener = (): void => {
            if (!pybricksControlChar.value) {
                return;
            }
            emitter(pybricksControlChar.value);
        };
        pybricksControlChar.addEventListener('characteristicvaluechanged', listener);
        return (): void =>
            pybricksControlChar.removeEventListener(
                'characteristicvaluechanged',
                listener,
            );
    });

    // forked tasks that will need to be canceled later
    const tasks = new Array<Task>();

    tasks.push(
        yield* takeEvery(pybricksControlChannel, handlePybricksControlValueChanged),
    );

    try {
        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call([pybricksControlChar, 'stopNotifications']);
        yield* call([pybricksControlChar, 'startNotifications']);
    } catch (err) {
        yield* cancel(tasks);
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    tasks.push(yield* takeEvery(writeCommand, handleWriteCommand, pybricksControlChar));

    let uartService: BluetoothRemoteGATTService;
    try {
        uartService = yield* call([server, 'getPrimaryService'], uartServiceUUID);
    } catch (err) {
        yield* cancel(tasks);
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            yield* put(
                bleDidFailToConnectPybricks({ reason: Reason.NoPybricksService }),
            );
        } else {
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
        }
        return;
    }

    let uartRxChar: BluetoothRemoteGATTCharacteristic;
    try {
        uartRxChar = yield* call([uartService, 'getCharacteristic'], uartRxCharUUID);
    } catch (err) {
        yield* cancel(tasks);
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    let uartTxChar: BluetoothRemoteGATTCharacteristic;
    try {
        uartTxChar = yield* call([uartService, 'getCharacteristic'], uartTxCharUUID);
    } catch (err) {
        yield* cancel(tasks);
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

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

    tasks.push(yield* takeEvery(uartTxChannel, handleUartValueChanged));

    try {
        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call([uartTxChar, 'stopNotifications']);
        yield* call([uartTxChar, 'startNotifications']);
    } catch (err) {
        yield* cancel(tasks);
        uartTxChannel.close();
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
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
        return;
    }

    tasks.push(yield* takeEvery(writeUart, handleWriteUart, uartRxChar));

    yield* put(bleDidConnectPybricks(device.id, device.name || ''));

    // wait for disconnection
    yield* takeMaybe(disconnectChannel);

    yield* cancel(tasks);
    uartTxChannel.close();
    pybricksControlChannel.close();

    yield* put(bleDidDisconnectPybricks());
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
