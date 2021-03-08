// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Manages connection to a Bluetooth Low Energy device running Pybricks firmware.

// TODO: this file needs to be combined with the firmware BLE connection management
// to reduce duplicated code

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
    BlePybricksServiceActionType,
    didFailToWriteCommand,
    didNotifyEvent,
    didWriteCommand,
} from '../ble-pybricks-service/actions';
import {
    ControlCharacteristicUUID as pybricksCommandCharacteristicUUID,
    ServiceUUID as pybricksServiceUUID,
} from '../ble-pybricks-service/protocol';
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
} from '../ble/actions';
import { BleConnectionState } from '../ble/reducers';
import { RootState } from '../reducers';
import {
    BleUartActionType,
    BleUartWriteAction,
    didFailToWrite as didFailToWriteUart,
    didNotify as didNotifyUart,
    didWrite as didWriteUart,
} from './actions';
import {
    RxCharUUID as uartRxCharUUID,
    ServiceUUID as uartServiceUUID,
    TxCharUUID as uartTxCharUUID,
} from './protocol';

function disconnect(
    server: BluetoothRemoteGATTServer,
    _action: BleDeviceDisconnectAction,
): void {
    server.disconnect();
}

function* handlePybricksControlValueChanged(data: DataView): Generator {
    yield* put(didNotifyEvent(data));
}

function* writePybricksCommand(
    char: BluetoothRemoteGATTCharacteristic,
    action: BleUartWriteAction,
): Generator {
    try {
        yield* call(() => char.writeValueWithoutResponse(action.value.buffer));
        yield* put(didWriteCommand(action.id));
    } catch (err) {
        yield* put(didFailToWriteCommand(action.id, err));
    }
}

function* handleUartValueChanged(data: DataView): Generator {
    yield* put(didNotifyUart(data));
}

function* writeUart(
    char: BluetoothRemoteGATTCharacteristic,
    action: BleUartWriteAction,
): Generator {
    try {
        yield* call(() => char.writeValueWithoutResponse(action.value.buffer));
        yield* put(didWriteUart(action.id));
    } catch (err) {
        yield* put(didFailToWriteUart(action.id, err));
    }
}

function* connect(_action: BleDeviceConnectAction): Generator {
    if (navigator.bluetooth === undefined) {
        yield* put(didFailToConnect({ reason: Reason.NoWebBluetooth }));
        return;
    }

    const available = yield* call(() => navigator.bluetooth.getAvailability());
    if (!available) {
        yield* put(didFailToConnect({ reason: Reason.NoBluetooth }));
        return;
    }

    let device: BluetoothDevice;
    try {
        device = yield* call(() =>
            navigator.bluetooth.requestDevice({
                filters: [{ services: [pybricksServiceUUID] }],
                optionalServices: [pybricksServiceUUID, uartServiceUUID],
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
            yield* put(didFailToConnect({ reason: Reason.NoService }));
        } else {
            yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
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
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
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

    try {
        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call([pybricksControlChar, 'stopNotifications']);
        yield* call([pybricksControlChar, 'startNotifications']);
    } catch (err) {
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    let uartService: BluetoothRemoteGATTService;
    try {
        uartService = yield* call([server, 'getPrimaryService'], uartServiceUUID);
    } catch (err) {
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            yield* put(didFailToConnect({ reason: Reason.NoService }));
        } else {
            yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        }
        return;
    }

    let uartRxChar: BluetoothRemoteGATTCharacteristic;
    try {
        uartRxChar = yield* call([uartService, 'getCharacteristic'], uartRxCharUUID);
    } catch (err) {
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    let uartTxChar: BluetoothRemoteGATTCharacteristic;
    try {
        uartTxChar = yield* call([uartService, 'getCharacteristic'], uartTxCharUUID);
    } catch (err) {
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
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

    try {
        // REVISIT: possible Pybricks firmware bug (or chromium bug on Linux)
        // where 'characteristicvaluechanged' is not called after disconnecting
        // and reconnecting unless we stop notifications before we start them
        // again. Wireshark shows that no enable notification descriptor write
        // is performed but notifications are received.
        yield* call([uartTxChar, 'stopNotifications']);
        yield* call([uartTxChar, 'startNotifications']);
    } catch (err) {
        uartTxChannel.close();
        pybricksControlChannel.close();
        server.disconnect();
        yield* takeMaybe(disconnectChannel);
        yield* put(didFailToConnect({ reason: Reason.Unknown, err }));
        return;
    }

    yield* takeEvery(pybricksControlChannel, handlePybricksControlValueChanged);
    yield* takeEvery(
        BlePybricksServiceActionType.WriteCommand,
        writePybricksCommand,
        pybricksControlChar,
    );

    yield* takeEvery(uartTxChannel, handleUartValueChanged);
    yield* takeEvery(BleUartActionType.Write, writeUart, uartRxChar);

    yield* put(didConnect());

    yield* takeMaybe(disconnectChannel);
    uartTxChannel.close();
    pybricksControlChannel.close();

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
