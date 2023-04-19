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
    /**
     * Request to stop the user program, if it is running.
     *
     * @since Pybricks Profile v1.0.0
     */
    StopUserProgram = 0,
    /**
     * Request to start the user program.
     *
     * @since Pybricks Profile v1.2.0
     */
    StartUserProgram = 1,
    /**
     *  Request to start the interactive REPL.
     *
     * @since Pybricks Profile v1.2.0
     */
    StartRepl = 2,
    /**
     *  Request to write user program metadata.
     *
     * @since Pybricks Profile v1.2.0
     */
    WriteUserProgramMeta = 3,
    /**
     * Request to write to user RAM.
     *
     * @since Pybricks Profile v1.2.0
     */
    WriteUserRam = 4,
    /**
     * Request to reboot in firmware update mode.
     *
     * @since Pybricks Profile v1.2.0
     */
    ResetInUpdateMode = 5,
}

/**
 * Creates a {@link CommandType.StopUserProgram} message.
 *
 * @since Pybricks Profile v1.0.0
 */
export function createStopUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StopUserProgram;
    return msg;
}

/**
 * Creates a {@link CommandType.StartUserProgram} message.
 *
 * @since Pybricks Profile v1.2.0
 */
export function createStartUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StartUserProgram;
    return msg;
}

/**
 * Creates a {@link CommandType.StartRepl} message.
 *
 * @since Pybricks Profile v1.2.0
 */
export function createStartReplCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StartRepl;
    return msg;
}

/**
 * Creates a {@link CommandType.WriteUserProgramMeta} message.
 * @param size The size of the user program in bytes.
 *
 * @since Pybricks Profile v1.2.0
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
 *
 * @since Pybricks Profile v1.2.0
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
    /**
     * Status report event.
     *
     * Received when notifications are enabled and when status changes.
     *
     * @since Pybricks Profile v1.0.0
     */
    StatusReport = 0,
}

/** Status indications received by Event.StatusReport */
export enum Status {
    /**
     * Battery voltage is low.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryLowVoltageWarning = 0,
    /**
     * Battery voltage is critically low.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryLowVoltageShutdown = 1,
    /**
     * Battery current is too high.
     *
     * @since Pybricks Profile v1.0.0
     */
    BatteryHighCurrent = 2,
    /**
     * Bluetooth Low Energy is advertising/discoverable.
     *
     * @since Pybricks Profile v1.0.0
     */
    BLEAdvertising = 3,
    /**
     * Bluetooth Low Energy has low signal.
     *
     * @since Pybricks Profile v1.0.0
     */
    BLELowSignal = 4,
    /**
     * Power button is currently pressed.
     *
     * @since Pybricks Profile v1.0.0
     */
    PowerButtonPressed = 5,
    /**
     * User program is currently running.
     *
     * @since Pybricks Profile v1.0.0
     */
    UserProgramRunning = 6,
    /**
     * Hub is shutting down.
     *
     * @since Pybricks Profile v1.1.0
     */
    Shutdown = 7,
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
 *
 * @since Pybricks Profile v1.0.0
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
    /**
     * Hub has an interactive REPL.
     *
     * @since Pybricks Profile v1.2.0
     */
    HasRepl = 1 << 0,
    /**
     * Hub supports {@link FileFormat.MultiMpy6}
     *
     * @since Pybricks Profile v1.2.0
     */
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
