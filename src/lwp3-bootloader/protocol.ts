// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

// Ref: https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#lego-hub-boot-loader-service

import { assert, hex } from '../utils';

/**
 * LEGO Powered Up Bootloader Service UUID.
 */
export const ServiceUUID = '00001625-1212-efde-1623-785feabcd123';

/**
 * LEGO Powered Up Bootloader Characteristic UUID.
 */
export const CharacteristicUUID = '00001626-1212-efde-1623-785feabcd123';

/**
 * The maximum message size that can be sent or received.
 */
export const MaxMessageSize = 20;

/**
 * LEGO Powered Up Hub IDs
 *
 * This is the subset of hubs that actually support this bootloader protocol.
 */
export enum HubType {
    MoveHub = 0x40,
    CityHub = 0x41,
    TechnicHub = 0x80,
}

/**
 * LEGO bootloader command bytecodes.
 */
export enum Command {
    EraseFlash = 0x11,
    ProgramFlash = 0x22,
    StartApp = 0x33,
    InitLoader = 0x44,
    GetInfo = 0x55,
    GetChecksum = 0x66,
    GetFlashState = 0x77,
    Disconnect = 0x88,
}

/**
 * Error message bytecode.
 */
export type ErrorMessage = 0x05;
export const ErrorBytecode: ErrorMessage = 0x05;

enum ErrorCode {
    UnknownCommand = 0x05,
}

/**
 * Result status.
 */
export enum Result {
    OK = 0x00,
    Error = 0xff,
}

/**
 * The largest allowable size for the payload of the ProgramFlash command.
 *
 * Theoretically, this is MTU - 9. However, City hub and Control+ hub report
 * MTU of 158 but don't seem to be able to handle receiving that much data.
 * Anything larger than 32 causes the bootloader to lock up.
 */
export const MaxProgramFlashSize: ReadonlyMap<HubType, number> = new Map<
    HubType,
    number
>([
    [HubType.MoveHub, 14],
    [HubType.CityHub, 32],
    [HubType.TechnicHub, 32],
]);

/**
 * Flash memory protection level.
 *
 * Refer to STM32 technical reference.
 */
export enum ProtectionLevel {
    None = 0x00,
    Level1 = 0x01,
    Level2 = 0x02,
}

/**
 * Protocol error. Thrown e.g. when there is a malformed message.
 */
export class ProtocolError extends Error {
    /**
     * Creates a new ProtocolError.
     * @param message The error message
     * @param data The bytecodes that caused the error
     */
    constructor(message: string, public data: DataView) {
        super(message);
    }
}

/**
 * Creates a new message to erase the flash memory.
 */
export function createEraseFlashRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.EraseFlash);
    return msg;
}

/**
 * Creates a new message to program the flash memory.
 * @param address The starting address.
 * @param payload The data (14 bytes max)
 */
export function createProgramFlashRequest(
    address: number,
    payload: ArrayBuffer,
): Uint8Array {
    const size = payload.byteLength;
    const msg = new Uint8Array(size + 6);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.ProgramFlash);
    view.setUint8(1, size + 4);
    view.setUint32(2, address, true);
    const payloadView = new DataView(payload);
    for (let i = 0; i < size; i++) {
        view.setUint8(6 + i, payloadView.getUint8(i));
    }
    return msg;
}

/**
 * Creates a new message to reboot an start the new firmware.
 */
export function createStartAppRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.StartApp);
    return msg;
}

/**
 * Creates a new message to prepare the bootloader to receive a new firmware.
 * @param fwSize The total size of the firmware to be flashed.
 */
export function createInitLoaderRequest(fwSize: number): Uint8Array {
    const msg = new Uint8Array(5);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.InitLoader);
    view.setUint32(1, fwSize, true);
    return msg;
}

/**
 * Creates a new message to get bootloader and device info.
 */
export function createGetInfoRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.GetInfo);
    return msg;
}

/**
 * Creates a new message to get the current checksum.
 */
export function createGetChecksumRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.GetChecksum);
    return msg;
}

/**
 * Creates a new message to get the flash memory protection state.
 *
 * This command is not implemented on some devices.
 */
export function createGetFlashStateRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.GetFlashState);
    return msg;
}

/**
 * Creates a new message to disconnect the connection.
 */
export function createDisconnectRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, Command.Disconnect);
    return msg;
}

/**
 * Gets the type of message.
 * @param msg The raw message data.
 */
export function getMessageType(msg: DataView): Command | ErrorMessage {
    // Technically, the first byte of an error message is the length, but it
    // is always 0x05 which is the same as the error message bytecode.
    return msg.getUint8(0);
}

/**
 * Parses an error message.
 * @param msg The raw message data.
 */
export function parseErrorResponse(msg: DataView): Command {
    assert(msg.getUint8(0) === 5, 'unexpected length');
    // Error responses are ordered differently compared to command responses.
    if (msg.getUint8(2) !== ErrorBytecode) {
        throw new ProtocolError(
            `expecting error bytecode 0x05 but got ${hex(msg.getUint8(2), 2)}`,
            msg,
        );
    }
    if (msg.getUint8(4) !== ErrorCode.UnknownCommand) {
        // "command not recognized" is only possible error code
        throw new ProtocolError(`unknown error code: ${hex(msg.getUint8(4), 2)}`, msg);
    }
    const command = msg.getUint8(3);
    return command;
}

/**
 * Parses an erase flash response message.
 * @param msg The raw message data.
 * @returns The result of the erase operation.
 */
export function parseEraseFlashResponse(msg: DataView): Result {
    assert(msg.getUint8(0) === Command.EraseFlash, 'expecting erase flash command');
    const result = msg.getUint8(1);
    return result;
}

/**
 * Parses a program flash response message.
 * @param msg The raw message data.
 * @returns The final checksum and the number of bytes written.
 */
export function parseProgramFlashResponse(msg: DataView): [number, number] {
    assert(msg.getUint8(0) === Command.ProgramFlash, 'expecting program flash command');
    const checksum = msg.getUint8(1);
    const count = msg.getUint32(2, true);
    return [checksum, count];
}

/**
 * Parses an initialization response message.
 * @param msg The raw message data.
 * @returns The result of the initialization.
 */
export function parseInitLoaderResponse(msg: DataView): Result {
    assert(msg.getUint8(0) === Command.InitLoader, 'expecting init loader command');
    const result = msg.getUint8(1);
    return result;
}

/**
 * Parses an information response message.
 * @param msg The raw message data.
 * @returns The bootloader software version, the starting and ending addresses
 * of where firmware can be flashed, and the hub type identifier.
 */
export function parseGetInfoResponse(msg: DataView): [number, number, number, HubType] {
    assert(msg.getUint8(0) === Command.GetInfo, 'expecting get info command');
    const version = msg.getUint32(1, true);
    const startAddress = msg.getUint32(5, true);
    const endAddress = msg.getUint32(9, true);
    const hubType = msg.getUint8(13);
    return [version, startAddress, endAddress, hubType];
}

/**
 * Parses a checksum response message.
 * @param msg The raw message data.
 * @returns The checksum of the data that has been flashed so far.
 */
export function parseGetChecksumResponse(msg: DataView): number {
    assert(msg.getUint8(0) === Command.GetChecksum, 'expecting get checksum command');
    const checksum = msg.getUint8(1);
    return checksum;
}

/**
 * Parses a flash protection state response message.
 * @param msg The raw message data.
 * @returns The protection level
 */
export function parseGetFlashStateResponse(msg: DataView): ProtectionLevel {
    assert(
        msg.getUint8(0) === Command.GetFlashState,
        'expecting get flash state command',
    );
    const level = msg.getUint8(1);
    return level;
}
