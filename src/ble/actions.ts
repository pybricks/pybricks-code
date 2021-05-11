// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
//
// Actions for managing Bluetooth Low Energy connections.

import { Action } from 'redux';

/**
 * Bluetooth low energy device action types.
 */
export enum BleDeviceActionType {
    /**
     * Connecting to a device has been requested.
     */
    Connect = 'ble.device.action.connect',
    /**
     * The connection completed successfully.
     */
    DidConnect = 'ble.device.action.didConnect',
    /**
     * The connection did not complete successfully.
     */
    DidFailToConnect = 'ble.device.action.didFailToConnect',
    /**
     * Disconnecting from a device has been requested.
     */
    Disconnect = 'ble.device.action.disconnect',
    /**
     * The device was disconnected.
     */
    DidDisconnect = 'ble.device.action.didDisconnect',
    /**
     * The device fail to disconnect.
     */
    DidFailToDisconnect = 'ble.device.action.didFailToDisconnect',
}

export type BleDeviceConnectAction = Action<BleDeviceActionType.Connect>;

/**
 * Creates an action that indicates connecting has been requested.
 */
export function connect(): BleDeviceConnectAction {
    return { type: BleDeviceActionType.Connect };
}

export type BleDeviceDidConnectAction = Action<BleDeviceActionType.DidConnect>;

/**
 * Creates an action that indicates a device was connected.
 */
export function didConnect(): BleDeviceDidConnectAction {
    return { type: BleDeviceActionType.DidConnect };
}

export enum BleDeviceFailToConnectReasonType {
    NoWebBluetooth = 'ble.device.didFailToConnect.noWebBluetooth',
    NoBluetooth = 'ble.device.didFailToConnect.noBluetooth',
    Canceled = 'ble.device.didFailToConnect.canceled',
    NoGatt = 'ble.device.didFailToConnect.noGatt',
    NoDeviceInfoService = 'ble.device.didFailToConnect.noDeviceInfoService',
    NoPybricksService = 'ble.device.didFailToConnect.noPybricksService',
    Unknown = 'ble.device.didFailToConnect.unknown',
}

type Reason<T extends BleDeviceFailToConnectReasonType> = {
    reason: T;
};

export type BleDeviceFailToConnectNoWebBluetoothReason =
    Reason<BleDeviceFailToConnectReasonType.NoWebBluetooth>;

export type BleDeviceFailToConnectNoBluetoothReason =
    Reason<BleDeviceFailToConnectReasonType.NoBluetooth>;

export type BleDeviceFailToConnectCanceledReason =
    Reason<BleDeviceFailToConnectReasonType.Canceled>;

export type BleDeviceFailToConnectNoGattReason =
    Reason<BleDeviceFailToConnectReasonType.NoGatt>;

export type BleDeviceFailToConnectNoDeviceInfoServiceReason =
    Reason<BleDeviceFailToConnectReasonType.NoDeviceInfoService>;

export type BleDeviceFailToConnectNoPybricksServiceReason =
    Reason<BleDeviceFailToConnectReasonType.NoPybricksService>;

export type BleDeviceFailToConnectUnknownReason =
    Reason<BleDeviceFailToConnectReasonType.Unknown> & {
        err: Error;
    };

export type BleDeviceDidFailToConnectReason =
    | BleDeviceFailToConnectNoWebBluetoothReason
    | BleDeviceFailToConnectNoBluetoothReason
    | BleDeviceFailToConnectCanceledReason
    | BleDeviceFailToConnectNoGattReason
    | BleDeviceFailToConnectNoDeviceInfoServiceReason
    | BleDeviceFailToConnectNoPybricksServiceReason
    | BleDeviceFailToConnectUnknownReason;

export type BleDeviceDidFailToConnectAction =
    Action<BleDeviceActionType.DidFailToConnect> & BleDeviceDidFailToConnectReason;

/**
 * Creates an action that indicates a device failed to connect.
 */
export function didFailToConnect(
    reason: BleDeviceDidFailToConnectReason,
): BleDeviceDidFailToConnectAction {
    return { type: BleDeviceActionType.DidFailToConnect, ...reason };
}

export type BleDeviceDisconnectAction = Action<BleDeviceActionType.Disconnect>;

/**
 * Creates an action that indicates disconnecting was requested.
 */
export function disconnect(): BleDeviceDisconnectAction {
    return { type: BleDeviceActionType.Disconnect };
}

export type BleDeviceDidDisconnectAction = Action<BleDeviceActionType.DidDisconnect>;

/**
 * Creates an action that indicates a device was disconnected.
 */
export function didDisconnect(): BleDeviceDidDisconnectAction {
    return { type: BleDeviceActionType.DidDisconnect };
}

export type BleDeviceDidFailToDisconnectAction =
    Action<BleDeviceActionType.DidFailToDisconnect>;

/**
 * Creates an action that indicates a device failed to disconnect.
 */
export function didFailToDisconnect(): BleDeviceDidFailToDisconnectAction {
    return { type: BleDeviceActionType.DidFailToDisconnect };
}

/**
 * Common type for all BLE connection actions.
 */
export type BLEConnectAction =
    | BleDeviceConnectAction
    | BleDeviceDidConnectAction
    | BleDeviceDidFailToConnectAction
    | BleDeviceDisconnectAction
    | BleDeviceDidDisconnectAction
    | BleDeviceDidFailToDisconnectAction;

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
