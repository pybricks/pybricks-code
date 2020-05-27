// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';
import { Command, HubType, ProtectionLevel, Result } from '../protocols/bootloader';
import { createCountFunc } from '../utils/iter';

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
     * The connection received a message.
     */
    DidReceive = 'bootloader.action.connection.did.receive',
    /**
     * The connection has been closed.
     */
    DidDisconnect = 'bootloader.action.connection.did.disconnect',
}

export type BootloaderConnectionConnectAction = Action<
    BootloaderConnectionActionType.Connect
>;

export function connect(): BootloaderConnectionConnectAction {
    return { type: BootloaderConnectionActionType.Connect };
}

export interface BootloaderConnectionDidConnectAction
    extends Action<BootloaderConnectionActionType.DidConnect> {
    canWriteWithoutResponse: boolean;
}

export function didConnect(
    canWriteWithoutResponse: boolean,
): BootloaderConnectionDidConnectAction {
    return { type: BootloaderConnectionActionType.DidConnect, canWriteWithoutResponse };
}

/**
 * Possible reasons a device could fail to connect.
 */
export enum BootloaderConnectionFailureReason {
    /** The reason is not known */
    Unknown = 'unknown',
    /** The connection was canceled */
    Canceled = 'canceled',
    /** Web Bluetooth is not available */
    NoWebBluetooth = 'no-web-bluetooth',
    /** Connected but failed to find the bootloader GATT service */
    GattServiceNotFound = 'gatt-service-not-found',
}

export interface BootloaderConnectionDidFailToConnectAction
    extends Action<BootloaderConnectionActionType.DidFailToConnect> {
    reason: BootloaderConnectionFailureReason;
    err?: Error;
}

export function didFailToConnect(
    reason: BootloaderConnectionFailureReason,
    err?: Error,
): BootloaderConnectionDidFailToConnectAction {
    return { type: BootloaderConnectionActionType.DidFailToConnect, reason, err };
}

export interface BootloaderConnectionDidErrorAction
    extends Action<BootloaderConnectionActionType.DidError> {
    err: Error;
}

export function didError(err: Error): BootloaderConnectionDidErrorAction {
    return { type: BootloaderConnectionActionType.DidError, err };
}

export interface BootloaderConnectionSendAction
    extends Action<BootloaderConnectionActionType.Send> {
    readonly data: ArrayBuffer;
    readonly withResponse: boolean;
}

export function send(
    data: ArrayBuffer,
    withResponse = true,
): BootloaderConnectionSendAction {
    return { type: BootloaderConnectionActionType.Send, data, withResponse };
}

export interface BootloaderConnectionDidSendAction
    extends Action<BootloaderConnectionActionType.DidSend> {
    err?: Error;
}

export function didSend(err?: Error): BootloaderConnectionDidSendAction {
    return { type: BootloaderConnectionActionType.DidSend, err };
}

export interface BootloaderConnectionDidReceiveAction
    extends Action<BootloaderConnectionActionType.DidReceive> {
    data: DataView;
}

export function didReceive(data: DataView): BootloaderConnectionDidReceiveAction {
    return { type: BootloaderConnectionActionType.DidReceive, data };
}

export type BootloaderConnectionDidDisconnectAction = Action<
    BootloaderConnectionActionType.DidDisconnect
>;

export function didDisconnect(): BootloaderConnectionDidDisconnectAction {
    return { type: BootloaderConnectionActionType.DidDisconnect };
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
    | BootloaderConnectionDidSendAction
    | BootloaderConnectionDidReceiveAction
    | BootloaderConnectionDidDisconnectAction;

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

const nextRequestId = createCountFunc();

interface BaseBootloaderRequestAction<T extends BootloaderRequestActionType>
    extends Action<T> {
    /**
     * Unique identifier for this action.
     */
    id: number;
}

/**
 * Action that requests to erase the flash memory.
 */
export type BootloaderEraseRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.Erase
>;

/**
 * Creates a request to erase the flash memory.
 */
export function eraseRequest(): BootloaderEraseRequestAction {
    return { type: BootloaderRequestActionType.Erase, id: nextRequestId() };
}

/**
 * Action that requests to program the flash memory.
 */
export interface BootloaderProgramRequestAction
    extends BaseBootloaderRequestAction<BootloaderRequestActionType.Program> {
    address: number;
    payload: ArrayBuffer;
}

/**
 * Creates a request to program the flash memory.
 * @param address The starting address in the flash memory.
 * @param payload The bytes to write (max 14 bytes!)
 */
export function programRequest(
    address: number,
    payload: ArrayBuffer,
): BootloaderProgramRequestAction {
    return {
        type: BootloaderRequestActionType.Program,
        id: nextRequestId(),
        address,
        payload,
    };
}

/**
 * Action that requests to reboot the hub.
 */
export type BootloaderRebootRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.Reboot
>;

/**
 * Creates a request to reboot the hub.
 */
export function rebootRequest(): BootloaderRebootRequestAction {
    return { type: BootloaderRequestActionType.Reboot, id: nextRequestId() };
}

/**
 * Action that requests to initialize the firmware flashing process.
 */
export interface BootloaderInitRequestAction
    extends BaseBootloaderRequestAction<BootloaderRequestActionType.Init> {
    firmwareSize: number;
}

/**
 * Creates a request to initialize the firmware flashing process.
 * @param firmwareSize The size of the firmware to written to flash memory.
 */
export function initRequest(firmwareSize: number): BootloaderInitRequestAction {
    return {
        type: BootloaderRequestActionType.Init,
        id: nextRequestId(),
        firmwareSize,
    };
}

/**
 * Action that requests information about the hub.
 */
export type BootloaderInfoRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.Info
>;

/**
 * Creates a request to get information about the hub.
 */
export function infoRequest(): BootloaderInfoRequestAction {
    return { type: BootloaderRequestActionType.Info, id: nextRequestId() };
}

/**
 * Action to get the checksum of the bytes that have been written to flash
 * so far.
 */
export type BootloaderChecksumRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.Checksum
>;

/**
 * Creates a request to get the checksum of the bytes that have been written
 * to flash so far.
 */
export function checksumRequest(): BootloaderChecksumRequestAction {
    return { type: BootloaderRequestActionType.Checksum, id: nextRequestId() };
}

/**
 * Action that requests the bootloader flash memory protection state.
 */
export type BootloaderStateRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.State
>;

/**
 * Creates a request to get the bootloader flash memory protection state.
 */
export function stateRequest(): BootloaderStateRequestAction {
    return { type: BootloaderRequestActionType.State, id: nextRequestId() };
}

/**
 * Action that requests to disconnect the hub.
 */
export type BootloaderDisconnectRequestAction = BaseBootloaderRequestAction<
    BootloaderRequestActionType.Disconnect
>;

/**
 * Creates a request to disconnect the hub.
 */
export function disconnectRequest(): BootloaderDisconnectRequestAction {
    return { type: BootloaderRequestActionType.Disconnect, id: nextRequestId() };
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
 * Action that indicates a request was sent or failed to send.
 */
export interface BootloaderDidRequestAction extends Action<BootloaderDidRequestType> {
    /**
     * The unique identifier of the action.
     */
    id: number;
    /**
     * The error on failure or undefined on success.
     */
    err?: Error;
}

/**
 * Creates an action that indicates a request was sent or failed to send.
 * @param id The unique identifier of the action.
 * @param err The error message on failure or undefined on success.
 */
export function didRequest(id: number, err?: Error): BootloaderDidRequestAction {
    return { type: BootloaderDidRequestType, id, err };
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

export interface BootloaderEraseResponseAction
    extends Action<BootloaderResponseActionType.Erase> {
    result: Result;
}

export function eraseResponse(result: Result): BootloaderEraseResponseAction {
    return { type: BootloaderResponseActionType.Erase, result };
}

export interface BootloaderProgramResponseAction
    extends Action<BootloaderResponseActionType.Program> {
    checksum: number;
    count: number;
}

export function programResponse(
    checksum: number,
    count: number,
): BootloaderProgramResponseAction {
    return { type: BootloaderResponseActionType.Program, checksum, count };
}

export interface BootloaderInitResponseAction
    extends Action<BootloaderResponseActionType.Init> {
    result: Result;
}

export function initResponse(result: Result): BootloaderInitResponseAction {
    return { type: BootloaderResponseActionType.Init, result };
}

export interface BootloaderInfoResponseAction
    extends Action<BootloaderResponseActionType.Info> {
    version: number;
    startAddress: number;
    endAddress: number;
    hubType: HubType;
}

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

export interface BootloaderChecksumResponseAction
    extends Action<BootloaderResponseActionType.Checksum> {
    checksum: number;
}

export function checksumResponse(checksum: number): BootloaderChecksumResponseAction {
    return { type: BootloaderResponseActionType.Checksum, checksum };
}

export interface BootloaderStateResponseAction
    extends Action<BootloaderResponseActionType.State> {
    level: ProtectionLevel;
}

export function stateResponse(level: ProtectionLevel): BootloaderStateResponseAction {
    return { type: BootloaderResponseActionType.State, level };
}

export interface BootloaderErrorResponseAction
    extends Action<BootloaderResponseActionType.Error> {
    command: Command;
}

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

/**
 * High-level bootloader actions.
 */
export enum BootloaderActionType {
    /**
     * Flash new firmware to the device.
     */
    FlashFirmware = 'bootloader.action.flash',
    /**
     * Firmware flash progress.
     */
    FlashProgress = 'bootloader.action.flash.progress',
}

/**
 * Action that flashes firmware to a hub.
 */
export interface BootloaderFlashFirmwareAction
    extends Action<BootloaderActionType.FlashFirmware> {
    /** The firmware zip file data or undefined to get firmware later. */
    data?: ArrayBuffer;
}

/**
 * Creates a new action to flash firmware to a hub.
 * @param data The firmware zip file data or undefined to get firmware later.
 */
export function flashFirmware(data?: ArrayBuffer): BootloaderFlashFirmwareAction {
    return { type: BootloaderActionType.FlashFirmware, data };
}

export interface BootloaderFlashProgressAction
    extends Action<BootloaderActionType.FlashProgress> {
    /**
     * The number of bytes that have been flashed so far.
     */
    complete: number;
    /**
     * The total number of bytes to be flashed.
     */
    total: number;
}

export function progress(
    complete: number,
    total: number,
): BootloaderFlashProgressAction {
    return { type: BootloaderActionType.FlashProgress, complete, total };
}

/**
 * Common type for all high-level bootloader actions.
 */
export type BootloaderAction =
    | BootloaderFlashFirmwareAction
    | BootloaderFlashProgressAction;
