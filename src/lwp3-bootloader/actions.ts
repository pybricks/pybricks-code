// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Action } from 'redux';
import { createAction } from '../actions';
import { Command, HubType, ProtectionLevel, Result } from './protocol';

/**
 * Initiate a connection.
 */
export const connect = createAction(() => ({
    type: 'bootloader.action.connection.connect',
}));

/**
 * The connection has been made.
 */
export const didConnect = createAction(() => ({
    type: 'bootloader.action.connection.didConnect',
}));

/**
 * Possible reasons a device could fail to connect.
 */
export enum BootloaderConnectionFailureReason {
    /** Web Bluetooth is not available */
    NoWebBluetooth = 'no-web-bluetooth',
    /** Bluetooth is not available */
    NoBluetooth = 'no-bluetooth',
    /** Connected but failed to find the bootloader GATT service */
    GattServiceNotFound = 'gatt-service-not-found',
    /** The connection was canceled */
    Canceled = 'canceled',
    /** The reason is not known */
    Unknown = 'unknown',
}

const didFailToConnectType = 'bootloader.action.connection.didFailToConnect';

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason.NoWebBluetooth,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason.NoWebBluetooth;
};

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason.NoBluetooth,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason.NoBluetooth;
};

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason.GattServiceNotFound,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason.GattServiceNotFound;
};

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason.Canceled,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason.Canceled;
};

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason.Unknown,
    err: Error,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason.Unknown;
    err: Error;
};

function didFailToConnectCreator<T extends BootloaderConnectionFailureReason>(
    reason: T,
    arg1?: Error,
): Action<typeof didFailToConnectType> & {
    reason: T;
    err: T extends BootloaderConnectionFailureReason.Unknown ? Error : never;
};

function didFailToConnectCreator(
    reason: BootloaderConnectionFailureReason,
    arg1?: Error,
): Action<typeof didFailToConnectType> & {
    reason: BootloaderConnectionFailureReason;
    err?: Error;
} {
    if (reason === BootloaderConnectionFailureReason.Unknown) {
        return {
            type: didFailToConnectType,
            reason,
            err: arg1,
        };
    }

    return { type: didFailToConnectType, reason };
}

/**
 * The connection was not successful.
 */
export const didFailToConnect = createAction(didFailToConnectCreator);

/**
 * There was a connection error.
 */
export const didError = createAction((err: Error) => ({
    type: 'bootloader.action.connection.didError',
    err,
}));

/**
 * Send a message using the connection.
 */
export const send = createAction((data: ArrayBuffer, withResponse = true) => ({
    type: 'bootloader.action.connection.send',
    data,
    withResponse,
}));

/**
 * Finished sending a message.
 */
export const didSend = createAction(() => ({
    type: 'bootloader.action.connection.didSend',
}));

/**
 * Sending a message failed with error.
 */
export const didFailToSend = createAction((err: Error) => ({
    type: 'bootloader.action.connection.didFailToSend',
    err,
}));

/**
 * The connection received a message.
 */
export const didReceive = createAction((data: DataView) => ({
    type: 'bootloader.action.connection.didReceive',
    data,
}));

/**
 * Initiate disconnection.
 */
export const disconnect = createAction(() => ({
    type: 'bootloader.action.connection.disconnect',
}));

/**
 * The connection has been closed.
 */
export const didDisconnect = createAction(() => ({
    type: 'bootloader.action.connection.didDisconnect',
}));

/**
 * Disconnecting failed.
 */
export const didFailToDisconnect = createAction(() => ({
    type: 'bootloader.action.connection.didFailToDisconnect',
}));

// LWP3 bootloader request message actions

/**
 * Creates a request to erase the flash memory.
 */
export const eraseRequest = createAction((id: number, isCityHub: boolean) => ({
    type: 'bootloader.action.request.eraseRequest',
    id,
    isCityHub,
}));

/**
 * Creates a request to program the flash memory.
 * @param address The starting address in the flash memory.
 * @param payload The bytes to write (max 14 bytes!)
 */
export const programRequest = createAction(
    (id: number, address: number, payload: ArrayBuffer) => ({
        type: 'bootloader.action.request.programRequest',
        id,
        address,
        payload,
    }),
);

/**
 * Creates a request to reboot the hub.
 */
export const rebootRequest = createAction((id: number) => ({
    type: 'bootloader.action.request.rebootRequest',
    id,
}));

/**
 * Creates a request to initialize the firmware flashing process.
 * @param firmwareSize The size of the firmware to written to flash memory.
 */
export const initRequest = createAction((id: number, firmwareSize: number) => ({
    type: 'bootloader.action.request.initRequest',
    id,
    firmwareSize,
}));

/**
 * Creates a request to get information about the hub.
 */
export const infoRequest = createAction((id: number) => ({
    type: 'bootloader.action.request.infoRequest',
    id,
}));

/**
 * Creates a request to get the checksum of the bytes that have been written
 * to flash so far.
 */
export const checksumRequest = createAction((id: number) => ({
    type: 'bootloader.action.request.checksumRequest',
    id,
}));

/**
 * Creates a request to get the bootloader flash memory protection state.
 */
export const stateRequest = createAction((id: number) => ({
    type: 'bootloader.action.request.stateRequest',
    id,
}));

/**
 * Creates a request to disconnect the hub.
 */
export const disconnectRequest = createAction((id: number) => ({
    type: 'bootloader.action.request.disconnectRequest',
    id,
}));

/**
 * Creates an action that indicates a request was sent.
 * @param id The unique identifier of the action.
 */
export const didRequest = createAction((id: number) => ({
    type: 'bootloader.action.didRequest',
    id,
}));

/**
 * Creates an action that indicates a request failed to send.
 * @param id The unique identifier of the action.
 * @param err The error message.
 */
export const didFailToRequest = createAction((id: number, err: Error) => ({
    type: 'bootloader.action.didFailToRequest',
    id,
    err,
}));

// Bootloader response actions for receiving responses from the connection.

export const eraseResponse = createAction((result: Result) => ({
    type: 'bootloader.action.response.eraseResponse',
    result,
}));

export const programResponse = createAction((checksum: number, count: number) => ({
    type: 'bootloader.action.response.programResponse',
    checksum,
    count,
}));

export const initResponse = createAction((result: Result) => ({
    type: 'bootloader.action.response.initResponse',
    result,
}));

export const infoResponse = createAction(
    (version: number, startAddress: number, endAddress: number, hubType: HubType) => ({
        type: 'bootloader.action.response.infoResponse',
        version,
        startAddress,
        endAddress,
        hubType,
    }),
);

export const checksumResponse = createAction((checksum: number) => ({
    type: 'bootloader.action.response.checksumResponse',
    checksum,
}));

export const stateResponse = createAction((level: ProtectionLevel) => ({
    type: 'bootloader.action.response.stateResponse',
    level,
}));

export const errorResponse = createAction((command: Command) => ({
    type: 'bootloader.action.response.errorResponse',
    command,
}));
