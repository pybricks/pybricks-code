// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Handles Bluetooth Low Energy connection to LEGO Wireless Protocol v3 Bootloader service.

import { END, eventChannel } from 'redux-saga';
import {
    call,
    cancel,
    delay,
    put,
    spawn,
    takeEvery,
    takeMaybe,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import { ensureError } from '../utils';
import {
    BootloaderConnectionFailureReason as Reason,
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didFailToSend,
    didReceive,
    didSend,
    disconnect,
    send,
} from './actions';
import {
    lwp3BootloaderCharacteristicUUID,
    lwp3BootloaderServiceUUID,
} from './protocol';

function* handleNotify(data: DataView): Generator {
    yield* put(didReceive(data));
}

function* write(
    characteristic: BluetoothRemoteGATTCharacteristic,
    action: ReturnType<typeof send>,
): Generator {
    try {
        if (action.withResponse) {
            yield* call(() => characteristic.writeValueWithResponse(action.data));
        } else {
            yield* call(() => characteristic.writeValueWithoutResponse(action.data));
        }
        yield* put(didSend());
    } catch (err) {
        yield* put(didFailToSend(ensureError(err)));
    }
}

function* handleConnect(): Generator {
    if (navigator.bluetooth === undefined) {
        yield* put(alertsShowAlert('ble', 'noWebBluetooth'));
        yield* put(didFailToConnect(Reason.NoWebBluetooth));
        return;
    }

    const available = yield* call(() => navigator.bluetooth.getAvailability());
    if (!available) {
        yield* put(alertsShowAlert('ble', 'bluetoothNotAvailable'));
        yield* put(didFailToConnect(Reason.NoBluetooth));
        return;
    }

    let device: BluetoothDevice;
    try {
        device = yield* call(() =>
            navigator.bluetooth.requestDevice({
                filters: [{ services: [lwp3BootloaderServiceUUID] }],
                optionalServices: [lwp3BootloaderServiceUUID],
            }),
        );
    } catch (err) {
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // this can happen if the use cancels the dialog
            yield* put(didFailToConnect(Reason.Canceled));
        } else {
            yield* put(didFailToConnect(Reason.Unknown, ensureError(err)));
        }
        return;
    }

    if (device.gatt === undefined) {
        yield* put(
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
        server = yield* call([device.gatt, 'connect']);
    } catch (err) {
        disconnectChannel.close();
        yield* put(didFailToConnect(Reason.Unknown, ensureError(err)));
        return;
    }

    // istanbul ignore if
    if (process.env.NODE_ENV !== 'test') {
        // give OS Bluetooth stack some time to settle
        yield* delay(1000);
    }

    let service: BluetoothRemoteGATTService;
    try {
        service = yield* call([server, 'getPrimaryService'], lwp3BootloaderServiceUUID);
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // Possibly/probably caused by Chrome BlueZ back-end bug
            // https://chromium-review.googlesource.com/c/chromium/src/+/2214098
            yield* put(didFailToConnect(Reason.GattServiceNotFound));
        } else {
            yield* put(didFailToConnect(Reason.Unknown, ensureError(err)));
        }
        return;
    }

    let characteristic: BluetoothRemoteGATTCharacteristic;
    try {
        characteristic = yield* call(
            [service, 'getCharacteristic'],
            lwp3BootloaderCharacteristicUUID,
        );
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect(Reason.Unknown, ensureError(err)));
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
            yield* call([characteristic, 'stopNotifications']);
        } catch {
            // HACK: Chromium on Linux (BlueZ) will not receive notifications
            // if a device disconnects while notifications are enabled and then
            // reconnects. So we have to call stopNotifications() first to get
            // back to a known state. https://crbug.com/1170085
        }
        yield* call([characteristic, 'startNotifications']);
    } catch (err) {
        notificationChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect(Reason.Unknown, ensureError(err)));
        return;
    }

    // Spawning write so that it can't be canceled. This is important because
    // other sagas always expect it to complete with success action or error
    // action.
    function* spawnWrite(action: ReturnType<typeof send>): Generator {
        yield* spawn(write, characteristic, action);
    }

    yield* takeEvery(notificationChannel, handleNotify);
    yield* takeEvery(send, spawnWrite);
    yield* takeEvery(disconnect, server.disconnect.bind(server));

    yield* put(didConnect());

    yield* takeMaybe(disconnectChannel);
    notificationChannel.close();
    try {
        yield* cancel(); // have to cancel to stop forked effects
    } finally {
        yield* put(didDisconnect());
    }
}

export default function* (): Generator {
    yield* takeEvery(connect, handleConnect);
}
