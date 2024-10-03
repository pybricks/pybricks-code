// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors
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
     * The optional payload parameter was added in Pybricks Profile v1.4.0.
     *
     * Parameters:
     * - payload: Optional program identifier (one byte). Slots 0--127 are
     *            reserved for downloaded user programs. Slots 128--255 are
     *            for builtin user programs. If no program identifier is
     *            given, the currently active program slot will be started.
     *
     * @since Pybricks Profile v1.2.0. Program identifier added in Pybricks Profile v1.4.0.
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
    /**
     * Request to write data to stdin.
     *
     * @since Pybricks Profile v1.3.0
     */
    WriteStdin = 6,
    /**
     * Requests to write to a buffer that is pre-allocated by a user program.
     *
     * Parameters:
     * - offset: The offset from the buffer base address (16-bit little-endian
     *   unsigned integer).
     * - payload: The data to write.
     *
     * @since Pybricks Profile v1.4.0
     */
    WriteAppData = 7,
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
export function createStartUserProgramCommand(slot: number | undefined): Uint8Array {
    const msg = new Uint8Array(slot === undefined ? 1 : 2);
    msg[0] = CommandType.StartUserProgram;
    if (slot !== undefined) {
        msg[1] = slot & 0xff;
    }
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

/**
 * Creates a {@link CommandType.WriteStdin} message.
 * @param payload The bytes to write.
 *
 * @since Pybricks Profile v1.3.0.
 */
export function createWriteStdinCommand(payload: ArrayBuffer): Uint8Array {
    const msg = new Uint8Array(1 + payload.byteLength);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteStdin);
    msg.set(new Uint8Array(payload), 1);
    return msg;
}

/**
 * Creates a {@link CommandType.WriteAppData} message.
 * @param offset The offset from the buffer base address
 * @param payload The bytes to write.
 *
 * @since Pybricks Profile v1.4.0.
 */
export function createWriteAppDataCommand(
    offset: number,
    payload: ArrayBuffer,
): Uint8Array {
    const msg = new Uint8Array(1 + 2 + payload.byteLength);
    const view = new DataView(msg.buffer);
    view.setUint8(0, CommandType.WriteAppData);
    view.setUint8(1, offset & 0xffff);
    msg.set(new Uint8Array(payload), 3);
    return msg;
}

/** Events are notifications received from the hub. */
export enum EventType {
    /**
     * Status report event.
     *
     * Received when notifications are enabled and when status changes.
     *
     * The payload is one 32-bit little-endian unsigned integer containing
     * ::pbio_pybricks_status_t flags and a one byte program identifier
     * representing the currently active program if it is running.
     *
     * @since Pybricks Profile v1.0.0. Program identifier added in Pybricks Profile v1.4.0.
     */
    StatusReport = 0,
    /**
     * Hub wrote to stdout event.
     *
     * @since Pybricks Profile v1.3.0
     */
    WriteStdout = 1,
    /**
     * Hub wrote to appdata event.
     *
     * @since Pybricks Profile v1.4.0
     */
    WriteAppData = 2,
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
 * Parses the payload of a write stdout.
 * @param msg The raw message data.
 * @returns The bytes that were written.
 *
 * @since Pybricks Profile v1.3.0
 */
export function parseWriteStdout(msg: DataView): ArrayBuffer {
    assert(msg.getUint8(0) === EventType.WriteStdout, 'expecting write stdout event');
    return msg.buffer.slice(1);
}

/**
 * Parses the payload of a app data message.
 * @param msg The raw message data.
 * @returns The bytes that were written.
 *
 * @since Pybricks Profile v1.4.0
 */
export function parseWriteAppData(msg: DataView): ArrayBuffer {
    assert(msg.getUint8(0) === EventType.WriteAppData, 'expecting write appdata event');
    return msg.buffer.slice(1);
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
    constructor(
        message: string,
        public value: DataView,
    ) {
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
     * Hub supports {@link FileFormat.MultiMpy6} (bytecode only, no native modules).
     *
     * @since Pybricks Profile v1.2.0
     */
    UserProgramMultiMpy6 = 1 << 1,

    /**
     * Hub supports {@link FileFormat.MultiMpy6} that include native modules
     * with MPY ABI v6.1.
     *
     * @since Pybricks Profile v1.3.0
     */
    UserProgramMultiMpy6Native6p1 = 1 << 2,

    /**
     * Hub supports builtin sensor port view monitoring program.
     *
     * @since Pybricks Profile v1.4.0.
     */
    HasPortView = 1 << 3,

    /**
     * Hub supports builtin IMU calibration program.
     *
     * @since Pybricks Profile v1.4.0.
     */
    HasIMUCalibration = 1 << 4,
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
