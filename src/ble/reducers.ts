// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
//
// Manages state for the Bluetooth Low Energy connection.
// This assumes that there is only one global connection to a single device.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { BleDeviceActionType } from './actions';

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

const connection: Reducer<BleConnectionState, Action> = (
    state = BleConnectionState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BleDeviceActionType.Connect:
            return BleConnectionState.Connecting;
        case BleDeviceActionType.DidConnect:
            return BleConnectionState.Connected;
        case BleDeviceActionType.Disconnect:
            return BleConnectionState.Disconnecting;
        case BleDeviceActionType.DidFailToConnect:
        case BleDeviceActionType.DidDisconnect:
            return BleConnectionState.Disconnected;
        default:
            return state;
    }
};

export interface BleState {
    readonly connection: BleConnectionState;
}

export default combineReducers({ connection });
