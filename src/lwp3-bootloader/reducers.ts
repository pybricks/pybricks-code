// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { BootloaderConnectionActionType, BootloaderRequestActionType } from './actions';

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

const connection: Reducer<BootloaderConnectionState, Action> = (
    state = BootloaderConnectionState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BootloaderConnectionActionType.Connect:
            return BootloaderConnectionState.Connecting;
        case BootloaderConnectionActionType.DidConnect:
        case BootloaderConnectionActionType.DidFailToDisconnect:
            return BootloaderConnectionState.Connected;
        case BootloaderConnectionActionType.Disconnect:
        case BootloaderRequestActionType.Reboot:
        case BootloaderRequestActionType.Disconnect:
            return BootloaderConnectionState.Disconnecting;
        case BootloaderConnectionActionType.DidDisconnect:
        case BootloaderConnectionActionType.DidFailToConnect:
            return BootloaderConnectionState.Disconnected;
        default:
            return state;
    }
};

export default combineReducers({ connection });
