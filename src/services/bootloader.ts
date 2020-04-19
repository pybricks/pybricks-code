import { Action, Dispatch } from 'redux';
import { ServiceUUID, CharacteristicUUID } from '../protocols/bootloader';
import {
    BootloaderConnectionActionType,
    didCancel,
    didError,
    didReceive,
    didDisconnect,
    didConnect,
    BootloaderConnectionSendAction,
    didSend,
} from '../actions/bootloader';
import { combineServices } from '.';

let device: BluetoothDevice | undefined;
let char: BluetoothRemoteGATTCharacteristic | undefined;

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
            char = await service.getCharacteristic(CharacteristicUUID);
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
        await char.writeValue((action as BootloaderConnectionSendAction).data);
        dispatch(didSend());
    } catch (err) {
        dispatch(didSend(err));
    }
}

export default combineServices(connect, send);
