import { Action } from 'redux';
import { Command, HubType, ProtectionLevel, Result } from '../protocols/bootloader';

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
     * The connection was cancelled.
     */
    DidCancel = 'bootloader.action.connection.did.cancel',
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

export type BootloaderConnectionDidCancelAction = Action<
    BootloaderConnectionActionType.DidCancel
>;

export function didCancel(): BootloaderConnectionDidCancelAction {
    return { type: BootloaderConnectionActionType.DidCancel };
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
    withResponse = false,
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

export type BootloaderEraseRequestAction = Action<BootloaderRequestActionType.Erase>;

export function eraseRequest(): BootloaderEraseRequestAction {
    return { type: BootloaderRequestActionType.Erase };
}

export interface BootloaderProgramRequestAction
    extends Action<BootloaderRequestActionType.Program> {
    address: number;
    payload: ArrayBuffer;
}

export function programRequest(
    address: number,
    payload: ArrayBuffer,
): BootloaderProgramRequestAction {
    return { type: BootloaderRequestActionType.Program, address, payload };
}

export type BootloaderRebootRequestAction = Action<BootloaderRequestActionType.Reboot>;

export function rebootRequest(): BootloaderRebootRequestAction {
    return { type: BootloaderRequestActionType.Reboot };
}

export interface BootloaderInitRequestAction
    extends Action<BootloaderRequestActionType.Init> {
    firmwareSize: number;
}

export function initRequest(firmwareSize: number): BootloaderInitRequestAction {
    return { type: BootloaderRequestActionType.Init, firmwareSize };
}

export type BootloaderInfoRequestAction = Action<BootloaderRequestActionType.Info>;

export function infoRequest(): BootloaderInfoRequestAction {
    return { type: BootloaderRequestActionType.Info };
}

export type BootloaderChecksumRequestAction = Action<
    BootloaderRequestActionType.Checksum
>;

export function checksumRequest(): BootloaderChecksumRequestAction {
    return { type: BootloaderRequestActionType.Checksum };
}

export type BootloaderStateRequestAction = Action<BootloaderRequestActionType.State>;

export function stateRequest(): BootloaderStateRequestAction {
    return { type: BootloaderRequestActionType.State };
}

export type BootloaderDisconnectRequestAction = Action<
    BootloaderRequestActionType.Disconnect
>;

export function disconnectRequest(): BootloaderDisconnectRequestAction {
    return { type: BootloaderRequestActionType.Disconnect };
}

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

export interface BootloaderFlashFirmwareAction
    extends Action<BootloaderActionType.FlashFirmware> {
    data: ArrayBuffer;
}

export function flashFirmware(data: ArrayBuffer): BootloaderFlashFirmwareAction {
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

export type BootloaderAction =
    | BootloaderFlashFirmwareAction
    | BootloaderFlashProgressAction;
