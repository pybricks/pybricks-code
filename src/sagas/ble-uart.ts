// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: sagas/ble-uart.ts
// Manages connection to a Bluetooth Low Energy device with the Nordic (nRF) UART service.

import { END, eventChannel } from 'redux-saga';
import {
    call,
    cancel,
    put,
    select,
    takeEvery,
    takeMaybe,
} from 'typed-redux-saga/macro';
import {
    BLEActionType,
    BleDeviceActionType as BLEDeviceActionType,
    BLEToggleAction,
    BleDeviceConnectAction,
    BleDeviceDisconnectAction,
    BleDeviceFailToConnectReasonType as Reason,
    connect as connectAction,
    didConnect,
    didDisconnect,
    didFailToConnect,
    disconnect as disconnectAction,
} from '../actions/ble';
import {
    BleUartActionType,
    BleUartWriteAction,
    didFailToWrite,
    didWrite,
    notify,
} from '../actions/ble-uart';
import {
    ServiceUUID as uartServiceUUID,
    TxCharUUID as uartTxCharUUID,
    RxCharUUID as urtRxCharUUID,
} from '../protocols/nrf-uart';
import { ServiceUUID as pybricksServiceUUID } from '../protocols/pybricks';
import { RootState } from '../reducers';
import { BleConnectionState } from '../reducers/ble';

function disconnect(
    server: BluetoothRemoteGATTServer,
    _action: BleDeviceDisconnectAction,
): void {
    server.disconnect();
}

function* handleValueChanged(data: DataView): Generator {
    yield* put(notify(data));
}

function* write(
    rxChar: BluetoothRemoteGATTCharacteristic,
    action: BleUartWriteAction,
): Generator {
    try {
        yield* call(() => rxChar.writeValueWithoutResponse(action.value.buffer));
        yield* put(didWrite(action.id));
    } catch (err) {
        yield* put(didFailToWrite(action.id, err));
    }
}

function* connect(_action: BleDeviceConnectAction): Generator {
    if (navigator.bluetooth === undefined) {
        yield* put(didFailToConnect({ reason: Reason.NoWebBluetooth }));
        return;
    }

    // TODO: check navigator.bluetooth.getAvailability()

    let device: BluetoothDevice;
    try {
        device = yield* call(() =>
            navigator.bluetooth.requestDevice({
                filters: [{ services: [pybricksServiceUUID] }],
                optionalServices: [uartServiceUUID],
            }),
        );
    } catch (err) {
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // this can happen if the use cancels the dialog
            yield* put(didFailToConnect({ reason: Reason.Canceled }));
        } else {
            yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        }
        return;
    }

    if (device.gatt === undefined) {
        yield* put(didFailToConnect({ reason: Reason.NoGatt }));
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
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    yield* takeEvery(BLEDeviceActionType.Disconnect, disconnect, server);

    let service: BluetoothRemoteGATTService;
    try {
        service = yield* call([server, 'getPrimaryService'], uartServiceUUID);
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // Possibly/probably caused by Chrome BlueZ back-end bug
            // https://chromium-review.googlesource.com/c/chromium/src/+/2214098
            yield* put(didFailToConnect({ reason: Reason.NoService }));
        } else {
            yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        }
        return;
    }

    let rxChar: BluetoothRemoteGATTCharacteristic;
    try {
        rxChar = yield* call([service, 'getCharacteristic'], urtRxCharUUID);
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    let txChar: BluetoothRemoteGATTCharacteristic;
    try {
        txChar = yield* call([service, 'getCharacteristic'], uartTxCharUUID);
    } catch (err) {
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    const txChannel = eventChannel<DataView>((emitter) => {
        const listener = (): void => {
            if (!txChar.value) {
                return;
            }
            emitter(txChar.value);
        };
        txChar.addEventListener('characteristicvaluechanged', listener);
        return (): void =>
            txChar.removeEventListener('characteristicvaluechanged', listener);
    });

    try {
        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call([txChar, 'stopNotifications']);
        yield* call([txChar, 'startNotifications']);
    } catch (err) {
        txChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    yield* takeEvery(txChannel, handleValueChanged);
    yield* takeEvery(BleUartActionType.Write, write, rxChar);

    yield* put(didConnect());

    yield* takeMaybe(disconnectChannel);
    txChannel.close();
    try {
        yield* cancel(); // have to cancel to stop forked effects
    } finally {
        yield* put(didDisconnect());
    }
}

function* toggle(_action: BLEToggleAction): Generator {
    const connectionState = (yield select(
        (s: RootState) => s.ble.connection,
    )) as BleConnectionState;

    switch (connectionState) {
        case BleConnectionState.Connected:
            yield* put(disconnectAction());
            break;
        case BleConnectionState.Disconnected:
            yield* put(connectAction());
            break;
    }
}

export default function* (): Generator {
    yield* takeEvery(BLEDeviceActionType.Connect, connect);
    yield* takeEvery(BLEActionType.Toggle, toggle);
}
