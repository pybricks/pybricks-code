// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Actions for managing Bluetooth Low Energy connections.

import { createAction } from '../actions';
/**
 * Creates an action that indicates connecting has been requested.
 */
export const connect = createAction(() => ({
    type: 'ble.device.action.connect',
}));

/**
 * Creates an action that indicates a device was connected.
 */
export const didConnect = createAction((id: string, name: string) => ({
    type: 'ble.device.action.didConnect',
    id,
    name,
}));

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

/**
 * Creates an action that indicates a device failed to connect.
 */
export const didFailToConnect = createAction(
    (reason: BleDeviceDidFailToConnectReason) => ({
        type: 'ble.device.action.didFailToConnect',
        ...reason,
    }),
);

/**
 * Creates an action that indicates disconnecting was requested.
 */
export const disconnect = createAction(() => ({
    type: 'ble.device.action.disconnect',
}));

/**
 * Creates an action that indicates a device was disconnected.
 */
export const didDisconnect = createAction(() => ({
    type: 'ble.device.action.didDisconnect',
}));

/**
 * Creates an action that indicates a device failed to disconnect.
 */
export const didFailToDisconnect = createAction(() => ({
    type: 'ble.device.action.didFailToDisconnect',
}));

/**
 * High-level BLE actions.
 */

export const toggleBluetooth = createAction(() => ({
    type: 'ble.action.toggle',
}));
