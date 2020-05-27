// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action, Dispatch } from '../actions';

import {
    BootloaderConnectionActionType,
    BootloaderConnectionFailureReason as Reason,
    didConnect,
    didDisconnect,
    didFailToConnect,
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
            dispatch(didFailToConnect(Reason.NoWebBluetooth));
            return;
        }
        // TODO: check navigator.bluetooth.getAvailability()
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
                dispatch(didFailToConnect(Reason.Canceled));
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
            if (
                err instanceof DOMException &&
                err.code === DOMException.NOT_FOUND_ERR
            ) {
                // Possibly/probably caused by Chrome BlueZ back-end bug
                // https://chromium-review.googlesource.com/c/chromium/src/+/2214098
                dispatch(didFailToConnect(Reason.GattServiceNotFound));
                return;
            }
            throw err;
        }

        // char.writeValueWithoutResponse() was introduced in Chrome 85.
        // Older versions of Chrome for Android will write without response
        // by default when using the deprecated writeValue().
        const canWriteWithoutResponse =
            char.writeValueWithoutResponse !== undefined ||
            /Android/i.test(navigator.userAgent);
        dispatch(didConnect(canWriteWithoutResponse));
    } catch (err) {
        dispatch(didFailToConnect(Reason.Unknown, err));
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
        if (action.withResponse) {
            await char.xWriteValueWithResponse(action.data);
        } else {
            await char.xWriteValueWithoutResponse(action.data);
        }
        dispatch(didSend());
    } catch (err) {
        dispatch(didSend(err));
    }
}

export default combineServices(connect, send);
