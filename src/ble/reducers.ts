// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2025 The Pybricks Authors
//
// Manages state for the Bluetooth Low Energy connection.
// This assumes that there is only one global connection to a single device.

import { Reducer, combineReducers } from 'redux';
import {
    bleConnectPybricks,
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDidFailToConnectPybricks,
    bleDidFailToDisconnectPybricks,
    bleDisconnectPybricks,
} from './actions';

/**
 * Describes the state of the BLE connection.
 */
export enum BleConnectionState {
    /**
     * No device is connected.
     */
    Disconnected = 'ble.connection.state.disconnected',
    /**
     * Connecting to a device.
     */
    Connecting = 'ble.connection.state.connecting',
    /**
     * Connected to a device.
     */
    Connected = 'ble.connection.state.connected',
    /**
     * Disconnecting from a device.
     */
    Disconnecting = 'ble.connection.state.disconnecting',
}

const connection: Reducer<BleConnectionState> = (
    state = BleConnectionState.Disconnected,
    action,
) => {
    if (bleConnectPybricks.matches(action)) {
        return BleConnectionState.Connecting;
    }

    if (
        bleDidConnectPybricks.matches(action) ||
        bleDidFailToDisconnectPybricks.matches(action)
    ) {
        return BleConnectionState.Connected;
    }

    if (bleDisconnectPybricks.matches(action)) {
        return BleConnectionState.Disconnecting;
    }

    if (
        bleDidFailToConnectPybricks.matches(action) ||
        bleDidDisconnectPybricks.matches(action)
    ) {
        return BleConnectionState.Disconnected;
    }

    return state;
};

export default combineReducers({
    connection,
});
