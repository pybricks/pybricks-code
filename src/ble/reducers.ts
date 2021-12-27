// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Manages state for the Bluetooth Low Energy connection.
// This assumes that there is only one global connection to a single device.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { BleDIServiceActionType } from '../ble-device-info-service/actions';
import { getHubTypeName } from '../ble-device-info-service/protocol';
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
        case BleDeviceActionType.DidFailToDisconnect:
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

const deviceName: Reducer<string, Action> = (state = '', action) => {
    switch (action.type) {
        case BleDeviceActionType.DidDisconnect:
            return '';
        case BleDeviceActionType.DidConnect:
            return action.name;
        default:
            return state;
    }
};

const deviceType: Reducer<string, Action> = (state = '', action) => {
    switch (action.type) {
        case BleDeviceActionType.DidDisconnect:
            return '';
        case BleDIServiceActionType.DidReceivePnPId:
            return getHubTypeName(action.pnpId);
        default:
            return state;
    }
};

const deviceFirmwareVersion: Reducer<string, Action> = (state = '', action) => {
    switch (action.type) {
        case BleDeviceActionType.DidDisconnect:
            return '';
        case BleDIServiceActionType.DidReceiveFirmwareRevision:
            return action.version;
        default:
            return state;
    }
};

export default combineReducers({
    connection,
    deviceName,
    deviceType,
    deviceFirmwareVersion,
});
