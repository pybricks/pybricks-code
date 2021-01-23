// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: sagas/lwp3-bootloader-ble.ts
// Handles Bluetooth Low Energy connection to LEGO Wireless Protocol v3 Bootloader service.

import { END, eventChannel } from 'redux-saga';
import { call, cancel, put, spawn, takeEvery, takeMaybe } from 'redux-saga/effects';
import {
    BootloaderConnectionAction,
    BootloaderConnectionActionType,
    BootloaderConnectionSendAction,
    BootloaderConnectionFailureReason as Reason,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didReceive,
    didSend,
} from '../actions/lwp3-bootloader';
import { CharacteristicUUID, ServiceUUID } from '../protocols/lwp3-bootloader';

function* handleNotify(data: DataView): Generator {
    yield put(didReceive(data));
}

function* write(
    characteristic: BluetoothRemoteGATTCharacteristic,
    action: BootloaderConnectionSendAction,
): Generator {
    try {
        if (action.withResponse) {
            yield call(() => characteristic.writeValueWithResponse(action.data));
        } else {
            yield call(() => characteristic.writeValueWithoutResponse(action.data));
        }
        yield put(didSend());
    } catch (err) {
        yield put(didSend(err));
    }
}

function* connect(_action: BootloaderConnectionAction): Generator {
    if (navigator.bluetooth === undefined) {
        yield put(didFailToConnect(Reason.NoWebBluetooth));
        return;
    }

    // TODO: check navigator.bluetooth.getAvailability()

    let device: BluetoothDevice;
    try {
        device = (yield call(() =>
            navigator.bluetooth.requestDevice({
                filters: [{ services: [ServiceUUID] }],
                optionalServices: [ServiceUUID],
            }),
        )) as BluetoothDevice;
    } catch (err) {
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // this can happen if the use cancels the dialog
            yield put(didFailToConnect(Reason.Canceled));
        } else {
            yield put(didFailToConnect(Reason.Unknown, err));
        }
        return;
    }

    if (device.gatt === undefined) {
        yield put(
            didFailToConnect(Reason.Unknown, new Error('Device does not support GATT')),
        );
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
        server = (yield call([device.gatt, 'connect'])) as BluetoothRemoteGATTServer;
    } catch (err) {
        disconnectChannel.close();
        yield put(didFailToConnect(Reason.Unknown, err));
        return;
    }

    let service: BluetoothRemoteGATTService;
    try {
        service = (yield call(
            [server, 'getPrimaryService'],
            ServiceUUID,
        )) as BluetoothRemoteGATTService;
    } catch (err) {
        server.disconnect();
        yield takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // Possibly/probably caused by Chrome BlueZ back-end bug
            // https://chromium-review.googlesource.com/c/chromium/src/+/2214098
            yield put(didFailToConnect(Reason.GattServiceNotFound));
        } else {
            yield put(didFailToConnect(Reason.Unknown, err));
        }
        return;
    }

    let characteristic: BluetoothRemoteGATTCharacteristic;
    try {
        characteristic = (yield call(
            [service, 'getCharacteristic'],
            CharacteristicUUID,
        )) as BluetoothRemoteGATTCharacteristic;
    } catch (err) {
        server.disconnect();
        yield takeMaybe(disconnectChannel);
        yield put(didFailToConnect(Reason.Unknown, err));
        return;
    }

    const notificationChannel = eventChannel<DataView>((emitter) => {
        const listener = (): void => {
            if (!characteristic.value) {
                return;
            }
            emitter(characteristic.value);
        };
        characteristic.addEventListener('characteristicvaluechanged', listener);
        return (): void =>
            characteristic.removeEventListener('characteristicvaluechanged', listener);
    });

    try {
        try {
            yield call([characteristic, 'stopNotifications']);
        } catch {
            // HACK: Chromium on Linux (BlueZ) will not receive notifications
            // if a device disconnects while notifications are enabled and then
            // reconnects. So we have to call stopNotifications() first to get
            // back to a known state. https://crbug.com/1170085
        }
        yield call([characteristic, 'startNotifications']);
    } catch (err) {
        notificationChannel.close();
        server.disconnect();
        yield takeMaybe(disconnectChannel);
        yield put(didFailToConnect(Reason.Unknown, err));
        return;
    }

    // Spawning write so that it can't be canceled. This is important because
    // other sagas always expect it to complete with success action or error
    // action.
    function* spawnWrite(action: BootloaderConnectionSendAction): Generator {
        yield spawn(write, characteristic, action);
    }

    yield takeEvery(notificationChannel, handleNotify);
    yield takeEvery(BootloaderConnectionActionType.Send, spawnWrite);
    yield takeEvery(
        BootloaderConnectionActionType.Disconnect,
        server.disconnect.bind(server),
    );

    yield put(didConnect());

    yield takeMaybe(disconnectChannel);
    notificationChannel.close();
    try {
        yield cancel(); // have to cancel to stop forked effects
    } finally {
        yield put(didDisconnect());
    }
}

export default function* (): Generator {
    yield takeEvery(BootloaderConnectionActionType.Connect, connect);
}
