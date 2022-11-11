// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Definitions related to the Pybricks Bluetooth low energy GATT service.

import { assert } from '../utils';

/** Pybricks service UUID. */
export const pybricksServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
/** Pybricks control/event characteristic UUID. */
export const pybricksControlEventCharacteristicUUID =
    'c5f50002-8280-46da-89f4-6d8051e4aeef';
/** Pybricks hub capabilities characteristic UUID. */
export const pybricksHubCapabilitiesCharacteristicUUID =
    'c5f50003-8280-46da-89f4-6d8051e4aeef';

/** Commands are instructions sent to the hub. */
export enum CommandType {
    /** Request to stop the user program, if it is running. */
    StopUserProgram = 0,
    /** Request to start the user program. */
    StartUserProgram = 1,
    /** Request to start the interactive REPL. */
    StartRepl = 2,
    /** Request to write user program metadata. */
    WriteUserProgramMeta = 3,
    /** Request to write to user RAM. */
    WriteUserRam = 4,
    /** Request to reboot in firmware update mode. */
    ResetInUpdateMode = 5,
}

/**
 * Creates a {@link CommandType.StopUserProgram} message.
 */
export function createStopUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StopUserProgram;
    return msg;
}

/**
 * Creates a {@link CommandType.StartUserProgram} message.
 */
export function createStartUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StartUserProgram;
    return msg;
}

/**
 * Creates a {@link CommandType.StartRepl} message.
 */
export function createStartReplCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StartRepl;
    return msg;
}

/**
 * Creates a {@link CommandType.WriteUserProgramMeta} message.
 * @param size The size of the user program in bytes.
 */
export function createWriteUserProgramMetaCommand(size: number): Uint8Array {
    const msg = new Uint8Array(5);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteUserProgramMeta);
    view.setUint32(1, size, true);
    return msg;
}

/**
 * Creates a {@link CommandType.WriteUserRam} message.
 * @param offset The offset from the user RAM base address.
 * @param payload The bytes to write.
 */
export function createWriteUserRamCommand(
    offset: number,
    payload: ArrayBuffer,
): Uint8Array {
    const msg = new Uint8Array(5 + payload.byteLength);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteUserRam);
    view.setUint32(1, offset, true);
    msg.set(new Uint8Array(payload), 5);
    return msg;
}

/** Events are notifications received from the hub. */
export enum EventType {
    /** Status report. Received when notifications are enabled and when status changes. */
    StatusReport = 0,
}

/** Status indications received by Event.StatusReport */
export enum Status {
    /** Battery voltage is low. */
    BatteryLowVoltageWarning = 0,
    /** Battery voltage is critically low. */
    BatteryLowVoltageShutdown = 1,
    /** Battery current is too high. */
    BatteryHighCurrent = 2,
    /** Bluetooth Low Energy is advertising/discoverable. */
    BLEAdvertising = 3,
    /** Bluetooth Low Energy has low signal. */
    BLELowSignal = 4,
    /** Power button is currently pressed. */
    PowerButtonPressed = 5,
    /** User program is currently running. */
    UserProgramRunning = 6,
}

/** Converts a Status enum value to a bit flag. */
export function statusToFlag(status: Status): number {
    return 1 << status;
}

/** Gets the event type from a message. */
export function getEventType(msg: DataView): EventType {
    return msg.getUint8(0) as EventType;
}

/**
 * Parses the payload of a status report message.
 * @param msg The raw message data.
 * @returns The status as bit flags.
 */
export function parseStatusReport(msg: DataView): number {
    assert(msg.getUint8(0) === EventType.StatusReport, 'expecting status report event');
    return msg.getUint32(1, true);
}

/**
 * Protocol error. Thrown e.g. when there is a malformed message.
 */
export class ProtocolError extends Error {
    /**
     * Creates a new ProtocolError.
     * @param message The error message
     * @param value The bytecodes that caused the error
     */
    constructor(message: string, public value: DataView) {
        super(message);
    }
}

/**
 * Hub capability flags for the hub capabilities characteristic.
 */
export enum HubCapabilityFlag {
    /** Hub has an interactive REPL. */
    HasRepl = 1 << 0,
    /** Hub supports {@link FileFormat.MultiMpy6} */
    UserProgramMultiMpy6 = 1 << 1,
}

/** Supported user program file formats. */
export enum FileFormat {
    /** MicroPython .mpy file with MPY v5. */
    Mpy5,
    /** MicroPython .mpy file with MPY v6. */
    Mpy6,
    /** Pybricks multi-MicroPython .mpy file with MPY v6. */
    MultiMpy6,
}
