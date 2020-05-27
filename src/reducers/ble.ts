// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { BLEConnectActionType } from '../actions/ble';

/**
 * Describes the state of the BLE connection.
 */
export enum BLEConnectionState {
    /**
     * No device is connected.
     */
    Disconnected = 'ble.connection.disconnected',
    /**
     * Connecting to a device.
     */
    Connecting = 'ble.connection.connecting',
    /**
     * Connected to a device.
     */
    Connected = 'ble.connection.connected',
    /**
     * Disconnecting from a device.
     */
    Disconnecting = 'ble.connection.disconnecting',
}

const connection: Reducer<BLEConnectionState> = (
    state = BLEConnectionState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BLEConnectActionType.Connect:
            return BLEConnectionState.Connecting;
        case BLEConnectActionType.DidConnect:
            return BLEConnectionState.Connected;
        case BLEConnectActionType.Disconnect:
            return BLEConnectionState.Disconnecting;
        case BLEConnectActionType.DidDisconnect:
            return BLEConnectionState.Disconnected;
        default:
            return state;
    }
};

export interface BLEState {
    readonly connection: BLEConnectionState;
}

export default combineReducers({ connection });
