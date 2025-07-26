// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors
//
// Manages state for the Bluetooth Low Energy connection.
// This assumes that there is only one global connection to a single device.

import { Reducer, combineReducers } from 'redux';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
} from '../ble-device-info-service/actions';
import { getHubTypeName } from '../ble-device-info-service/protocol';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
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

const deviceName: Reducer<string> = (state = '', action) => {
    if (bleDidDisconnectPybricks.matches(action)) {
        return '';
    }

    if (bleDidConnectPybricks.matches(action)) {
        return action.name;
    }

    return state;
};

const deviceType: Reducer<string> = (state = '', action) => {
    if (bleDidDisconnectPybricks.matches(action)) {
        return '';
    }

    if (bleDIServiceDidReceivePnPId.matches(action)) {
        return getHubTypeName(action.pnpId);
    }

    return state;
};

const deviceFirmwareVersion: Reducer<string> = (state = '', action) => {
    if (bleDidDisconnectPybricks.matches(action)) {
        return '';
    }

    if (bleDIServiceDidReceiveFirmwareRevision.matches(action)) {
        return action.version;
    }

    return state;
};

const deviceLowBatteryWarning: Reducer<boolean> = (state = false, action) => {
    if (bleDidDisconnectPybricks.matches(action)) {
        return false;
    }

    if (didReceiveStatusReport.matches(action)) {
        return Boolean(
            action.statusFlags & statusToFlag(Status.BatteryLowVoltageWarning),
        );
    }

    return state;
};

const deviceBatteryCharging: Reducer<boolean> = (state = false, action) => {
    if (bleDidDisconnectPybricks.matches(action)) {
        return false;
    }

    // TODO: hub does not currently have a status flag for this

    return state;
};

export default combineReducers({
    connection,
    deviceName,
    deviceType,
    deviceFirmwareVersion,
    deviceLowBatteryWarning,
    deviceBatteryCharging,
});
