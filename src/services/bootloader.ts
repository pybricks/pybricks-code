import { Action, Dispatch } from 'redux';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionSendAction,
    didCancel,
    didConnect,
    didDisconnect,
    didError,
    didReceive,
    didSend,
} from '../actions/bootloader';
import { CharacteristicUUID, ServiceUUID } from '../protocols/bootloader';
import {
    PolyfillBluetoothRemoteGATTCharacteristic,
    polyfillBluetoothRemoteGATTCharacteristic,
} from '../utils/web-bluetooth';
import { combineServices } from '.';

let device: BluetoothDevice | undefined;
let char: PolyfillBluetoothRemoteGATTCharacteristic | undefined;

async function connect(action: Action, dispatch: Dispatch): Promise<void> {
    if (action.type !== BootloaderConnectionActionType.Connect) {
        return;
    }

    try {
        if (device) {
            throw Error('already connected');
        }
        if (navigator.bluetooth === undefined) {
            throw Error('No web bluetooth');
        }
        try {
            device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [ServiceUUID] }],
                optionalServices: [ServiceUUID],
            });
        } catch (err) {
            if (
                err instanceof DOMException &&
                err.code === DOMException.NOT_FOUND_ERR
            ) {
                // this error is received if the user clicks the cancel button in
                // the bluetooth scan dialog
                dispatch(didCancel());
                return;
            }
            throw err;
        }
        if (device.gatt === undefined) {
            throw Error('Device does not support GATT');
        }
        device.addEventListener('gattserverdisconnected', () => {
            device = undefined;
            char = undefined;
            dispatch(didDisconnect());
        });
        const server = await device.gatt.connect();
        try {
            const service = await server.getPrimaryService(ServiceUUID);
            char = polyfillBluetoothRemoteGATTCharacteristic(
                await service.getCharacteristic(CharacteristicUUID),
            );
            char.addEventListener('characteristicvaluechanged', () => {
                if (!char || !char.value) {
                    return;
                }
                dispatch(didReceive(char.value));
            });
            await char.startNotifications();
        } catch (err) {
            device.gatt.disconnect();
            throw err;
        }
        dispatch(didConnect());
    } catch (err) {
        dispatch(didError(err));
    }
}

async function send(action: Action, dispatch: Dispatch): Promise<void> {
    if (action.type !== BootloaderConnectionActionType.Send) {
        return;
    }
    try {
        if (!char) {
            throw Error('Not connected');
        }
        const sendAction = action as BootloaderConnectionSendAction;
        if (sendAction.withResponse) {
            await char.writeValueWithResponse(sendAction.data);
        } else {
            await char.writeValueWithoutResponse(sendAction.data);
        }
        dispatch(didSend());
    } catch (err) {
        dispatch(didSend(err));
    }
}

export default combineServices(connect, send);
