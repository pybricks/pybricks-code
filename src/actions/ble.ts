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

export enum BLEConnectActionType {
    /**
     * Begin async connect.
     */
    BeginConnect = 'ble.connect.begin',
    /**
     * End async connect (success).
     */
    EndConnect = 'ble.connect.end',
    /**
     * Begin async disconnect.
     */
    BeginDisconnect = 'ble.disconnect.begin',
    /**
     * End async disconnect (can be sent without sending BeginDisconnect first).
     */
    EndDisconnect = 'ble.disconnect.end',
}

type BLEConnectAction = Action<BLEConnectActionType>;

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

function beginConnect(): BLEConnectAction {
    return { type: BLEConnectActionType.BeginConnect };
}

function endConnect(): BLEConnectAction {
    return { type: BLEConnectActionType.EndConnect };
}

function beginDisconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.BeginDisconnect };
}

function endDisconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.EndDisconnect };
}

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
        dispatch(beginConnect());
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
            dispatch(endDisconnect());
            return;
        }
        if (device.gatt === undefined) {
            dispatch(notification.add('error', 'Device does not support GATT.'));
            dispatch(endDisconnect());
            return;
        }
        device.addEventListener('gattserverdisconnected', () => {
            device = undefined;
            rxChar = undefined;
            dispatch(endDisconnect());
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
        dispatch(endConnect());
    };
}

export function disconnect(): BLEThunkAction {
    return async function (dispatch): Promise<void> {
        dispatch(beginDisconnect());
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
