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
 * Response that indicates {@link bleConnectPybricks} failed.
 */
export const bleDidFailToConnectPybricks = createAction(
    (reason: BleDeviceDidFailToConnectReason) => ({
        type: 'ble.action.didFailToConnectPybricks',
        ...reason,
    }),
);

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
