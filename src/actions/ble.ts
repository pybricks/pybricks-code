// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';
import { assert } from '../utils';
import { createCountFunc } from '../utils/iter';

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

export enum BLEDataActionType {
    /**
     * Write data.
     */
    Write = 'ble.data.action.write',
    /**
     * Writing completed successfully.
     */
    DidWrite = 'ble.data.didWrite',
    /**
     * Writing failed.
     */
    DidFailToWrite = 'ble.data.action.didFailToWrite',
    /**
     * Notify that data was received.
     */
    Notify = 'ble.data.action.receive',
}

const nextId = createCountFunc();

export type BLEDataWriteAction = Action<BLEDataActionType.Write> & {
    id: number;
    value: Uint8Array;
};

export function write(value: Uint8Array): BLEDataWriteAction {
    assert(value.length <= 20, 'value can be at most 20 bytes');
    return { type: BLEDataActionType.Write, id: nextId(), value };
}

export type BLEDataDidWriteAction = Action<BLEDataActionType.DidWrite> & {
    id: number;
};

export function didWrite(id: number): BLEDataDidWriteAction {
    return { type: BLEDataActionType.DidWrite, id };
}

export type BLEDataDidFailToWriteAction = Action<BLEDataActionType.DidFailToWrite> & {
    id: number;
    err: Error;
};

export function didFailToWrite(id: number, err: Error): BLEDataDidFailToWriteAction {
    return { type: BLEDataActionType.DidFailToWrite, id, err };
}

export type BLEDataNotifyAction = Action<BLEDataActionType.Notify> & {
    value: DataView;
};

export function notify(value: DataView): BLEDataNotifyAction {
    return { type: BLEDataActionType.Notify, value };
}

/** Common type for low-level BLE data actions. */
export type BLEDataAction =
    | BLEDataWriteAction
    | BLEDataDidWriteAction
    | BLEDataDidFailToWriteAction
    | BLEDataNotifyAction;

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
