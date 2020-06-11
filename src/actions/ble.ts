// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

/**
 * Bluetooth low energy connection action types.
 */
export enum BLEConnectActionType {
    /**
     * Connecting to a device has been requested.
     */
    Connect = 'ble.action.connect',
    /**
     * The connection completed successfully.
     */
    DidConnect = 'ble.action.did.connect',
    /**
     * Disconnecting from a device has been requested.
     */
    Disconnect = 'ble.action.disconnect',
    /**
     * End async disconnect (can be sent without sending BeginDisconnect first).
     */
    DidDisconnect = 'ble.action.did.disconnect',
}

/**
 * Common type for all BLE connection actions.
 */
export type BLEConnectAction = Action<BLEConnectActionType>;

/**
 * Creates an action that indicates connecting has been requested.
 */
export function connect(): BLEConnectAction {
    return { type: BLEConnectActionType.Connect };
}

/**
 * Creates an action that indicates a device was connected.
 */
export function didConnect(): BLEConnectAction {
    return { type: BLEConnectActionType.DidConnect };
}

/**
 * Creates an action that indicates disconnecting was requested.
 */
export function disconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.Disconnect };
}

/**
 * Creates an action that indicates a device was disconnected.
 */
export function didDisconnect(): BLEConnectAction {
    return { type: BLEConnectActionType.DidDisconnect };
}

/**
 * High-level BLE actions.
 */
export enum BLEActionType {
    Toggle = 'ble.action.toggle',
}

export type BLEToggleAction = Action<BLEActionType.Toggle>;

export function toggleBluetooth(): BLEToggleAction {
    return { type: BLEActionType.Toggle };
}

/** Common type for high-level BLE actions */
export type BLEAction = BLEToggleAction;
