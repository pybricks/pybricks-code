// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action, Dispatch } from '../actions';
import {
    BLEActionType,
    BLEConnectActionType,
    BLEDataActionType,
    connect as connectAction,
    didConnect,
    didDisconnect,
    disconnect as disconnectAction,
    notify,
} from '../actions/ble';
import { stop } from '../actions/hub';
import * as notification from '../actions/notification';
import { RootState } from '../reducers';
import { BLEConnectionState } from '../reducers/ble';
import {
    PolyfillBluetoothRemoteGATTCharacteristic,
    polyfillBluetoothRemoteGATTCharacteristic,
} from '../utils/web-bluetooth';
import { combineServices } from '.';

const pybricksServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';

// nRF UART service (Nus)
const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusMaxSize = 20;

let device: BluetoothDevice | undefined;
let rxChar: PolyfillBluetoothRemoteGATTCharacteristic | undefined;

async function connect(action: Action, dispatch: Dispatch): Promise<void> {
    if (action.type !== BLEConnectActionType.Connect) {
        return;
    }

    if (device !== undefined) {
        dispatch(notification.add('error', 'A device is already connected.'));
        return;
    }
    if (navigator.bluetooth === undefined) {
        dispatch(
            notification.add(
                'error',
                'This web browser does not support Web Bluetooth or it is not enabled.',
                'https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md',
            ),
        );
        return;
    }
    // TODO: check navigator.bluetooth.getAvailability()
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [pybricksServiceUUID] }],
            optionalServices: [bleNusServiceUUID],
        });
    } catch (err) {
        if (err instanceof DOMException && err.code === DOMException.NOT_FOUND_ERR) {
            // this can happen if the use cancels the dialog
            console.debug('User cancelled connect');
        } else {
            console.error(err);
            dispatch(
                notification.add(
                    'error',
                    'Unexpected error, check developer console for details.',
                ),
            );
        }
        dispatch(didDisconnect());
        return;
    }
    if (device.gatt === undefined) {
        dispatch(notification.add('error', 'Device does not support GATT.'));
        dispatch(didDisconnect());
        return;
    }
    device.addEventListener('gattserverdisconnected', () => {
        device = undefined;
        rxChar = undefined;
        dispatch(didDisconnect());
    });
    const server = await device.gatt.connect();
    try {
        const service = await server.getPrimaryService(bleNusServiceUUID);
        rxChar = polyfillBluetoothRemoteGATTCharacteristic(
            await service.getCharacteristic(bleNusCharRXUUID),
        );
        const txChar = await service.getCharacteristic(bleNusCharTXUUID);
        txChar.addEventListener('characteristicvaluechanged', () => {
            if (!txChar.value) {
                return;
            }
            dispatch(notify(txChar.value));
        });
        await txChar.startNotifications();
    } catch (err) {
        console.error(err);
        dispatch(notification.add('error', 'Getting nRF UART service failed.'));
        device.gatt.disconnect();
        return;
    }
    dispatch(didConnect());
    // Try to force a soft reset so the hub is in a known state
    dispatch(stop());
}

function disconnect(action: Action): void {
    if (action.type !== BLEConnectActionType.Disconnect) {
        return;
    }
    device?.gatt?.disconnect();
}

async function write(action: Action): Promise<void> {
    if (action.type !== BLEDataActionType.Write) {
        return;
    }
    const value = action.value.buffer;
    for (let i = 0; i < value.byteLength; i += bleNusMaxSize) {
        await rxChar?.xWriteValueWithoutResponse(value.slice(i, i + bleNusMaxSize));
    }
}

function toggle(action: Action, dispatch: Dispatch, state: RootState): void {
    if (action.type !== BLEActionType.Toggle) {
        return;
    }
    switch (state.ble.connection) {
        case BLEConnectionState.Connected:
            dispatch(disconnectAction());
            break;
        case BLEConnectionState.Disconnected:
            dispatch(connectAction());
            break;
    }
}

export default combineServices(connect, disconnect, write, toggle);
