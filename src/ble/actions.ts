// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Actions for managing Bluetooth Low Energy connections.

import { createAction } from '../actions';
/**
 * Creates an action that initiates a connection to a hub running Pybricks firmware.
 */
export const bleConnectPybricks = createAction(() => ({
    type: 'ble.action.connectPybricks',
}));

/**
 * Response that indicates {@link bleConnectPybricks} succeeded.
 */
export const bleDidConnectPybricks = createAction((id: string, name: string) => ({
    type: 'ble.device.action.didConnectPybricks',
    id,
    name,
}));

/**
 * Response that indicates {@link bleConnectPybricks} failed.
 */
export const bleDidFailToConnectPybricks = createAction(() => ({
    type: 'ble.action.didFailToConnectPybricks',
}));

/**
 * Creates an action to request disconnecting a hub running Pybricks firmware.
 */
export const bleDisconnectPybricks = createAction(() => ({
    type: 'ble.action.disconnectPybricks',
}));

/**
 * Creates an action that indicates that {@link bleDisconnectPybricks} succeeded.
 */
export const bleDidDisconnectPybricks = createAction(() => ({
    type: 'ble.action.didDisconnectPybricks',
}));

/**
 * Creates an action that indicates that {@link bleDisconnectPybricks} failed.
 */
export const bleDidFailToDisconnectPybricks = createAction(() => ({
    type: 'ble.action.didFailToDisconnectPybricks',
}));

/**
 * High-level BLE actions.
 */

export const toggleBluetooth = createAction(() => ({
    type: 'ble.action.toggle',
}));
