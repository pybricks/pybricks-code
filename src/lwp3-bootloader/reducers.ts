// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didFailToDisconnect,
    disconnect,
    disconnectRequest,
    rebootRequest,
} from './actions';

/**
 * Describes the state of the bootloader connection.
 */
export enum BootloaderConnectionState {
    /**
     * No device is connected.
     */
    Disconnected = 'bootloader.connection.disconnected',
    /**
     * Connecting to a device.
     */
    Connecting = 'bootloader.connection.connecting',
    /**
     * Connected to a device.
     */
    Connected = 'bootloader.connection.connected',
    /**
     * Disconnecting from a device.
     */
    Disconnecting = 'bootloader.connection.disconnecting',
}

const connection: Reducer<BootloaderConnectionState> = (
    state = BootloaderConnectionState.Disconnected,
    action,
) => {
    if (connect.matches(action)) {
        return BootloaderConnectionState.Connecting;
    }

    if (didConnect.matches(action) || didFailToDisconnect.matches(action)) {
        return BootloaderConnectionState.Connected;
    }

    if (
        disconnect.matches(action) ||
        rebootRequest.matches(action) ||
        disconnectRequest.matches(action)
    ) {
        return BootloaderConnectionState.Disconnecting;
    }

    if (didDisconnect.matches(action) || didFailToConnect.matches(action)) {
        return BootloaderConnectionState.Disconnected;
    }

    return state;
};

export default combineReducers({ connection });
