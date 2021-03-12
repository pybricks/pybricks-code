// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Definitions related to the Pybricks Bluetooth low energy GATT service.

import { assert } from '../utils';

/** Pybricks service UUID. */
export const ServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
/** Pybricks control characteristic UUID. */
export const ControlCharacteristicUUID = 'c5f50002-8280-46da-89f4-6d8051e4aeef';

/** Commands are instructions sent to the hub. */
export enum CommandType {
    /** Request to stop the user program, if it is running. */
    StopUserProgram = 0,
}

/**
 * Creates a stop user program command message.
 */
export function createStopUserProgramCommand(): Uint8Array {
    const msg = new Uint8Array(1);
    msg[0] = CommandType.StopUserProgram;
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
