// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Action } from 'redux';
import { Command, HubType, ProtectionLevel, Result } from './protocol';

/**
 * Bootloader BLE connection actions.
 */
export enum BootloaderConnectionActionType {
    /**
     * Initiate a connection.
     */
    Connect = 'bootloader.action.connection.connect',
    /**
     * The connection has been made.
     */
    DidConnect = 'bootloader.action.connection.did.connect',
    /**
     * The connection was not successful.
     */
    DidFailToConnect = 'bootloader.action.connection.did.connect.fail',
    /**
     * There was a connection error.
     */
    DidError = 'bootloader.action.connection.did.error',
    /**
     * Send a message using the connection.
     */
    Send = 'bootloader.action.connection.send',
    /**
     * Finished sending a message.
     */
    DidSend = 'bootloader.action.connection.did.send',
    /**
     * Sending a message failed with error.
     */
    DidFailToSend = 'bootloader.action.connection.did.failToSend',
    /**
     * The connection received a message.
     */
    DidReceive = 'bootloader.action.connection.did.receive',
    /**
     * Initiate disconnection/
     */
    Disconnect = 'bootloader.action.connection.disconnect',
    /**
     * The connection has been closed.
     */
    DidDisconnect = 'bootloader.action.connection.did.disconnect',
    /**
     * Disconnecting failed.
     */
    DidFailToDisconnect = 'bootloader.action.connection.did.failToDisconnect',
}

export type BootloaderConnectionConnectAction =
    Action<BootloaderConnectionActionType.Connect>;

export function connect(): BootloaderConnectionConnectAction {
    return { type: BootloaderConnectionActionType.Connect };
}

export type BootloaderConnectionDidConnectAction =
    Action<BootloaderConnectionActionType.DidConnect>;

export function didConnect(): BootloaderConnectionDidConnectAction {
    return { type: BootloaderConnectionActionType.DidConnect };
}

export type BootloaderConnectionDisconnectAction =
    Action<BootloaderConnectionActionType.Disconnect>;

export function disconnect(): BootloaderConnectionDisconnectAction {
    return { type: BootloaderConnectionActionType.Disconnect };
}

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

type Reason<T extends BootloaderConnectionFailureReason> = {
    reason: T;
};

export type BootloaderConnectionFailToConnectNoWebBluetoothReason =
    Reason<BootloaderConnectionFailureReason.NoWebBluetooth>;

export type BootloaderConnectionFailToConnectNoBluetoothReason =
    Reason<BootloaderConnectionFailureReason.NoBluetooth>;

export type BootloaderConnectionFailToConnectGattServiceNotFoundReason =
    Reason<BootloaderConnectionFailureReason.GattServiceNotFound>;

export type BootloaderConnectionFailToConnectCanceledReason =
    Reason<BootloaderConnectionFailureReason.Canceled>;

export type BootloaderConnectionFailToConnectUnknownReason =
    Reason<BootloaderConnectionFailureReason.Unknown> & {
        err: Error;
    };

export type BootloaderConnectionDidFailToConnectReason =
    | BootloaderConnectionFailToConnectNoWebBluetoothReason
    | BootloaderConnectionFailToConnectNoBluetoothReason
    | BootloaderConnectionFailToConnectGattServiceNotFoundReason
    | BootloaderConnectionFailToConnectCanceledReason
    | BootloaderConnectionFailToConnectUnknownReason;

export type BootloaderConnectionDidFailToConnectAction =
    Action<BootloaderConnectionActionType.DidFailToConnect> &
        BootloaderConnectionDidFailToConnectReason;

export function didFailToConnect(
    reason: Exclude<
        BootloaderConnectionFailureReason,
        BootloaderConnectionFailureReason.Unknown
    >,
): BootloaderConnectionDidFailToConnectAction;

export function didFailToConnect(
    reason: BootloaderConnectionFailureReason.Unknown,
    err: Error,
): BootloaderConnectionDidFailToConnectAction;

export function didFailToConnect(
    reason: BootloaderConnectionFailureReason,
    arg1?: Error,
): BootloaderConnectionDidFailToConnectAction {
    if (reason === BootloaderConnectionFailureReason.Unknown) {
        return <BootloaderConnectionDidFailToConnectAction>{
            type: BootloaderConnectionActionType.DidFailToConnect,
            reason,
            err: arg1,
        };
    }
    return { type: BootloaderConnectionActionType.DidFailToConnect, reason };
}

export type BootloaderConnectionDidErrorAction =
    Action<BootloaderConnectionActionType.DidError> & {
        err: Error;
    };

export function didError(err: Error): BootloaderConnectionDidErrorAction {
    return { type: BootloaderConnectionActionType.DidError, err };
}

export type BootloaderConnectionSendAction =
    Action<BootloaderConnectionActionType.Send> & {
        readonly data: ArrayBuffer;
        readonly withResponse: boolean;
    };

export function send(
    data: ArrayBuffer,
    withResponse = true,
): BootloaderConnectionSendAction {
    return { type: BootloaderConnectionActionType.Send, data, withResponse };
}

export type BootloaderConnectionDidSendAction =
    Action<BootloaderConnectionActionType.DidSend>;

export function didSend(): BootloaderConnectionDidSendAction {
    return { type: BootloaderConnectionActionType.DidSend };
}

export type BootloaderConnectionDidFailToSendAction =
    Action<BootloaderConnectionActionType.DidFailToSend> & {
        err: Error;
    };

export function didFailToSend(err: Error): BootloaderConnectionDidFailToSendAction {
    return { type: BootloaderConnectionActionType.DidFailToSend, err };
}

export type BootloaderConnectionDidReceiveAction =
    Action<BootloaderConnectionActionType.DidReceive> & {
        data: DataView;
    };

export function didReceive(data: DataView): BootloaderConnectionDidReceiveAction {
    return { type: BootloaderConnectionActionType.DidReceive, data };
}

export type BootloaderConnectionDidDisconnectAction =
    Action<BootloaderConnectionActionType.DidDisconnect>;

export function didDisconnect(): BootloaderConnectionDidDisconnectAction {
    return { type: BootloaderConnectionActionType.DidDisconnect };
}

export type BootloaderConnectionDidFailToDisconnectAction =
    Action<BootloaderConnectionActionType.DidFailToDisconnect>;

export function didFailToDisconnect(): BootloaderConnectionDidFailToDisconnectAction {
    return { type: BootloaderConnectionActionType.DidFailToDisconnect };
}

/**
 * Common type for all bootloader connection actions.
 */
export type BootloaderConnectionAction =
    | BootloaderConnectionConnectAction
    | BootloaderConnectionDidConnectAction
    | BootloaderConnectionDidFailToConnectAction
    | BootloaderConnectionDidErrorAction
    | BootloaderConnectionSendAction
    | BootloaderConnectionDidSendAction
    | BootloaderConnectionDidFailToSendAction
    | BootloaderConnectionDidReceiveAction
    | BootloaderConnectionDisconnectAction
    | BootloaderConnectionDidDisconnectAction
    | BootloaderConnectionDidFailToDisconnectAction;

/**
 * Bootloader request actions for sending commands over the connection.
 */
export enum BootloaderRequestActionType {
    Erase = 'bootloader.action.request.erase',
    Program = 'bootloader.action.request.program',
    Reboot = 'bootloader.action.request.reboot',
    Init = 'bootloader.action.request.init',
    Info = 'bootloader.action.request.info',
    Checksum = 'bootloader.action.request.checksum',
    State = 'bootloader.action.request.state',
    Disconnect = 'bootloader.action.request.disconnect',
}

type BaseBootloaderRequestAction<T extends BootloaderRequestActionType> = Action<T> & {
    /**
     * Unique identifier for this action.
     */
    id: number;
};

/**
 * Action that requests to erase the flash memory.
 */
export type BootloaderEraseRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Erase>;

/**
 * Creates a request to erase the flash memory.
 */
export function eraseRequest(id: number): BootloaderEraseRequestAction {
    return { type: BootloaderRequestActionType.Erase, id };
}

/**
 * Action that requests to program the flash memory.
 */
export type BootloaderProgramRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Program> & {
        address: number;
        payload: ArrayBuffer;
    };

/**
 * Creates a request to program the flash memory.
 * @param address The starting address in the flash memory.
 * @param payload The bytes to write (max 14 bytes!)
 */
export function programRequest(
    id: number,
    address: number,
    payload: ArrayBuffer,
): BootloaderProgramRequestAction {
    return {
        type: BootloaderRequestActionType.Program,
        id,
        address,
        payload,
    };
}

/**
 * Action that requests to reboot the hub.
 */
export type BootloaderRebootRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Reboot>;

/**
 * Creates a request to reboot the hub.
 */
export function rebootRequest(id: number): BootloaderRebootRequestAction {
    return { type: BootloaderRequestActionType.Reboot, id };
}

/**
 * Action that requests to initialize the firmware flashing process.
 */
export type BootloaderInitRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Init> & {
        firmwareSize: number;
    };

/**
 * Creates a request to initialize the firmware flashing process.
 * @param firmwareSize The size of the firmware to written to flash memory.
 */
export function initRequest(
    id: number,
    firmwareSize: number,
): BootloaderInitRequestAction {
    return {
        type: BootloaderRequestActionType.Init,
        id,
        firmwareSize,
    };
}

/**
 * Action that requests information about the hub.
 */
export type BootloaderInfoRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Info>;

/**
 * Creates a request to get information about the hub.
 */
export function infoRequest(id: number): BootloaderInfoRequestAction {
    return { type: BootloaderRequestActionType.Info, id };
}

/**
 * Action to get the checksum of the bytes that have been written to flash
 * so far.
 */
export type BootloaderChecksumRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Checksum>;

/**
 * Creates a request to get the checksum of the bytes that have been written
 * to flash so far.
 */
export function checksumRequest(id: number): BootloaderChecksumRequestAction {
    return { type: BootloaderRequestActionType.Checksum, id };
}

/**
 * Action that requests the bootloader flash memory protection state.
 */
export type BootloaderStateRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.State>;

/**
 * Creates a request to get the bootloader flash memory protection state.
 */
export function stateRequest(id: number): BootloaderStateRequestAction {
    return { type: BootloaderRequestActionType.State, id };
}

/**
 * Action that requests to disconnect the hub.
 */
export type BootloaderDisconnectRequestAction =
    BaseBootloaderRequestAction<BootloaderRequestActionType.Disconnect>;

/**
 * Creates a request to disconnect the hub.
 */
export function disconnectRequest(id: number): BootloaderDisconnectRequestAction {
    return { type: BootloaderRequestActionType.Disconnect, id };
}

/**
 * Common type for all bootloader requests.
 */
export type BootloaderRequestAction =
    | BootloaderEraseRequestAction
    | BootloaderProgramRequestAction
    | BootloaderRebootRequestAction
    | BootloaderInitRequestAction
    | BootloaderInfoRequestAction
    | BootloaderChecksumRequestAction
    | BootloaderStateRequestAction
    | BootloaderDisconnectRequestAction;

/**
 * Action type for bootloader did request action.
 */
export type BootloaderDidRequestType = 'bootloader.action.did.request';

/**
 * Action type for bootloader did request action.
 */
export const BootloaderDidRequestType = 'bootloader.action.did.request';

/**
 * Action that indicates a request was sent.
 */
export type BootloaderDidRequestAction = Action<BootloaderDidRequestType> & {
    /**
     * The unique identifier of the action.
     */
    id: number;
};

/**
 * Creates an action that indicates a request was sent.
 * @param id The unique identifier of the action.
 */
export function didRequest(id: number): BootloaderDidRequestAction {
    return { type: BootloaderDidRequestType, id };
}

/**
 * Action type for bootloader did fail to request action.
 */
export type BootloaderDidFailToRequestType = 'bootloader.action.did.failToRequest';

/**
 * Action type for bootloader did fail to request action.
 */
export const BootloaderDidFailToRequestType = 'bootloader.action.did.failToRequest';

/**
 * Action that indicates a request failed to send.
 */
export type BootloaderDidFailToRequestAction =
    Action<BootloaderDidFailToRequestType> & {
        /**
         * The unique identifier of the action.
         */
        id: number;
        /**
         * The error.
         */
        err: Error;
    };

/**
 * Creates an action that indicates a request failed to send.
 * @param id The unique identifier of the action.
 * @param err The error message.
 */
export function didFailToRequest(
    id: number,
    err: Error,
): BootloaderDidFailToRequestAction {
    return { type: BootloaderDidFailToRequestType, id, err };
}

/**
 * Bootloader response actions for receiving responses from the connection.
 */
export enum BootloaderResponseActionType {
    Erase = 'bootloader.action.response.erase',
    Program = 'bootloader.action.response.program',
    Init = 'bootloader.action.response.init',
    Info = 'bootloader.action.response.info',
    Checksum = 'bootloader.action.response.checksum',
    State = 'bootloader.action.response.state',
    Error = 'bootloader.action.response.error',
}

export type BootloaderEraseResponseAction =
    Action<BootloaderResponseActionType.Erase> & {
        result: Result;
    };

export function eraseResponse(result: Result): BootloaderEraseResponseAction {
    return { type: BootloaderResponseActionType.Erase, result };
}

export type BootloaderProgramResponseAction =
    Action<BootloaderResponseActionType.Program> & {
        checksum: number;
        count: number;
    };

export function programResponse(
    checksum: number,
    count: number,
): BootloaderProgramResponseAction {
    return { type: BootloaderResponseActionType.Program, checksum, count };
}

export type BootloaderInitResponseAction = Action<BootloaderResponseActionType.Init> & {
    result: Result;
};

export function initResponse(result: Result): BootloaderInitResponseAction {
    return { type: BootloaderResponseActionType.Init, result };
}

export type BootloaderInfoResponseAction = Action<BootloaderResponseActionType.Info> & {
    version: number;
    startAddress: number;
    endAddress: number;
    hubType: HubType;
};

export function infoResponse(
    version: number,
    startAddress: number,
    endAddress: number,
    hubType: HubType,
): BootloaderInfoResponseAction {
    return {
        type: BootloaderResponseActionType.Info,
        version,
        startAddress,
        endAddress,
        hubType,
    };
}

export type BootloaderChecksumResponseAction =
    Action<BootloaderResponseActionType.Checksum> & {
        checksum: number;
    };

export function checksumResponse(checksum: number): BootloaderChecksumResponseAction {
    return { type: BootloaderResponseActionType.Checksum, checksum };
}

export type BootloaderStateResponseAction =
    Action<BootloaderResponseActionType.State> & {
        level: ProtectionLevel;
    };

export function stateResponse(level: ProtectionLevel): BootloaderStateResponseAction {
    return { type: BootloaderResponseActionType.State, level };
}

export type BootloaderErrorResponseAction =
    Action<BootloaderResponseActionType.Error> & {
        command: Command;
    };

export function errorResponse(command: Command): BootloaderErrorResponseAction {
    return { type: BootloaderResponseActionType.Error, command };
}

/**
 * Common type for all bootloader response actions.
 */
export type BootloaderResponseAction =
    | BootloaderEraseResponseAction
    | BootloaderProgramResponseAction
    | BootloaderInitResponseAction
    | BootloaderInfoResponseAction
    | BootloaderChecksumResponseAction
    | BootloaderStateResponseAction
    | BootloaderErrorResponseAction;
