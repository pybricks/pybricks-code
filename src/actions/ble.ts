// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
    PolyfillBluetoothRemoteGATTCharacteristic,
    polyfillBluetoothRemoteGATTCharacteristic,
} from '../utils/web-bluetooth';
import * as notification from './notification';

const pybricksServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';

// nRF UART service (Nus)
const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusMaxSize = 20;

let device: BluetoothDevice | undefined;
let rxChar: PolyfillBluetoothRemoteGATTCharacteristic | undefined;

/**
 * Bluetooth low energy connection action types.
 */
export enum BLEConnectActionType {
    /**
     * Connecting to a device has been requested.
     */
    WillConnect = 'ble.action.will.connect',
    /**
     * The connection completed successfully.
     */
    DidConnect = 'ble.action.did.connect',
    /**
     * Disconnecting from a device has been requested.
     */
    WillDisconnect = 'ble.action.will.disconnect',
    /**
     * End async disconnect (can be sent without sending BeginDisconnect first).
     */
    DidDisconnect = 'ble.action.did.disconnect',
}

/**
 * Common type for all BLE connection actions.
 */
type BLEConnectAction = Action<BLEConnectActionType>;

/**
 * Creates an action that indicates connecting has been requested.
 */
function willConnect(): BLEConnectAction {
    return { type: BLEConnectActionType.WillConnect };
}

/**
 * Creates an action that indicates a device was connected.
 */
function didConnect(): BLEConnectAction {
    return { type: BLEConnectActionType.DidConnect };
}

/**
 * Creates an action that indicates disconnecting was requested.
 */
function willDisconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.WillDisconnect };
}

/**
 * Creates an action that indicates a device was disconnected.
 */
function didDisconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.DidDisconnect };
}

export enum BLEDataActionType {
    /**
     * Send data.
     */
    SendData = 'ble.data.send',
    /**
     * Data was received.
     */
    ReceivedData = 'ble.data.receive',
}

export interface BLEDataAction extends Action<BLEDataActionType> {
    value: DataView;
}

export type BLEThunkAction = ThunkAction<Promise<void>, {}, {}, Action>;

export function connect(): BLEThunkAction {
    return async function (dispatch): Promise<void> {
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
        dispatch(willConnect());
        try {
            device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [pybricksServiceUUID] }],
                optionalServices: [bleNusServiceUUID],
            });
        } catch (err) {
            if (
                err instanceof DOMException &&
                err.code === DOMException.NOT_FOUND_ERR
            ) {
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
                dispatch({ type: BLEDataActionType.ReceivedData, value: txChar.value });
            });
            await txChar.startNotifications();
        } catch (err) {
            console.error(err);
            dispatch(notification.add('error', 'Getting nRF UART service failed.'));
            device.gatt.disconnect();
            return;
        }
        dispatch(didConnect());
    };
}

export function disconnect(): BLEThunkAction {
    return async function (dispatch): Promise<void> {
        dispatch(willDisconnect());
        device?.gatt?.disconnect();
    };
}

export function write(value: ArrayBuffer): BLEThunkAction {
    return async function (): Promise<void> {
        // TODO: do we need to dispatch any Action<>s here?
        for (let i = 0; i < value.byteLength; i += bleNusMaxSize) {
            await rxChar?.xWriteValueWithoutResponse(value.slice(i, i + bleNusMaxSize));
        }
    };
}
