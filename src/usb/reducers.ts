// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors
//
// Manages state for the USB connection.
// This assumes that there is only one global connection to a single device.

import { Reducer, combineReducers } from 'redux';
import {
    usbConnectPybricks,
    usbDidConnectPybricks,
    usbDidDisconnectPybricks,
    usbDidFailToConnectPybricks,
    usbDidFailToDisconnectPybricks,
    usbDisconnectPybricks,
    usbHotPlugConnectPybricks,
} from './actions';

/**
 * Describes the state of the USB connection.
 */
export enum UsbConnectionState {
    /**
     * No device is connected.
     */
    Disconnected = 'usb.connection.state.disconnected',
    /**
     * Connecting to a device.
     */
    Connecting = 'usb.connection.state.connecting',
    /**
     * Connected to a device.
     */
    Connected = 'usb.connection.state.connected',
    /**
     * Disconnecting from a device.
     */
    Disconnecting = 'usb.connection.state.disconnecting',
}

const connection: Reducer<UsbConnectionState> = (
    state = UsbConnectionState.Disconnected,
    action,
) => {
    if (
        usbConnectPybricks.matches(action) ||
        usbHotPlugConnectPybricks.matches(action)
    ) {
        return UsbConnectionState.Connecting;
    }

    if (
        usbDidConnectPybricks.matches(action) ||
        usbDidFailToDisconnectPybricks.matches(action)
    ) {
        return UsbConnectionState.Connected;
    }

    if (usbDisconnectPybricks.matches(action)) {
        return UsbConnectionState.Disconnecting;
    }

    if (
        usbDidFailToConnectPybricks.matches(action) ||
        usbDidDisconnectPybricks.matches(action)
    ) {
        return UsbConnectionState.Disconnected;
    }

    return state;
};

export default combineReducers({
    connection,
});
