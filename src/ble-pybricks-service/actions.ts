// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
// actions/blePybricksService.ts: Actions for Bluetooth Low Energy Pybricks service

import { Action } from 'redux';

/**
 * BLE Pybricks service actions types.
 */
export enum BlePybricksServiceActionType {
    /**
     * Write command to control characteristic.
     */
    WriteCommand = 'blePybricksService.action.writeCommand',
    /**
     * Writing command to control characteristic completed successfully.
     */
    DidWriteCommand = 'blePybricksService.action.didWriteCommand',
    /**
     * Writing command to control characteristic failed.
     */
    DidFailToWriteCommand = 'blePybricksService.action.didFailToWriteCommand',
    /**
     * Event notification was received from the control characteristic.
     */
    DidNotifyEvent = 'blePybricksService.action.didNotifyEvent',
}

/**
 * Action that request to write a command to the Pybricks service control characteristic.
 */
export type BlePybricksServiceWriteCommandAction =
    Action<BlePybricksServiceActionType.WriteCommand> & {
        id: number;
        value: Uint8Array;
    };

/**
 * Action that request to write a command to the Pybricks service control characteristic.
 */
export function writeCommand(
    id: number,
    value: Uint8Array,
): BlePybricksServiceWriteCommandAction {
    return {
        type: BlePybricksServiceActionType.WriteCommand,
        id,
        value,
    };
}

/**
 * Action that indicates sending a command to the Pybricks service control characteristic was successful.
 */
export type BlePybricksServiceDidWriteCommandAction =
    Action<BlePybricksServiceActionType.DidWriteCommand> & {
        id: number;
    };

/**
 * Action that indicates sending a command to the Pybricks service control characteristic was successful.
 */
export function didWriteCommand(id: number): BlePybricksServiceDidWriteCommandAction {
    return {
        type: BlePybricksServiceActionType.DidWriteCommand,
        id,
    };
}

/**
 * Action that indicates sending a command to the Pybricks service control characteristic failed.
 */
export type BlePybricksServiceDidFailToWriteCommandAction =
    Action<BlePybricksServiceActionType.DidFailToWriteCommand> & {
        id: number;
        err: Error;
    };

/**
 * Action that indicates sending a command to the Pybricks service control characteristic failed.
 */
export function didFailToWriteCommand(
    id: number,
    err: Error,
): BlePybricksServiceDidFailToWriteCommandAction {
    return {
        type: BlePybricksServiceActionType.DidFailToWriteCommand,
        id,
        err,
    };
}

/**
 * Action that indicates an event notification was received on the Pybricks service control characteristic.
 */
export type BlePybricksServiceDidNotifyEventAction =
    Action<BlePybricksServiceActionType.DidNotifyEvent> & {
        value: DataView;
    };

/**
 * Action that indicates an event notification was received on the Pybricks service control characteristic.
 */
export function didNotifyEvent(
    value: DataView,
): BlePybricksServiceDidNotifyEventAction {
    return {
        type: BlePybricksServiceActionType.DidNotifyEvent,
        value,
    };
}

/** Common type for BLE Pybricks service actions. */
export type BlePybricksServiceAction =
    | BlePybricksServiceWriteCommandAction
    | BlePybricksServiceDidWriteCommandAction
    | BlePybricksServiceDidFailToWriteCommandAction
    | BlePybricksServiceDidNotifyEventAction;

/** Action types for commands sent via the Pybricks service control characteristic. */
export enum BlePybricksServiceCommandActionType {
    SendStopUserProgram = 'blePybricksServiceCommand.action.sendStopUserProgram',
    DidSend = 'blePybricksServiceCommand.action.didSend',
    DidFailToSend = 'blePybricksServiceCommand.action.didFailToSend',
}

type TransactionId = {
    /** Unique identifier for the transaction set in the "send" command. */
    id: number;
};

/** Action that requests a stop user program to be sent. */
export type BlePybricksServiceCommandSendStopUserProgram =
    Action<BlePybricksServiceCommandActionType.SendStopUserProgram> & TransactionId;

/**
 * Action that requests a stop user program to be sent.
 * @param id Unique identifier for this transaction.
 */
export function sendStopUserProgramCommand(
    id: number,
): BlePybricksServiceCommandSendStopUserProgram {
    return { type: BlePybricksServiceCommandActionType.SendStopUserProgram, id };
}

/**
 *  Action that indicates that a command was successfully sent.
 */
export type BlePybricksServiceCommandDidSendAction =
    Action<BlePybricksServiceCommandActionType.DidSend> & TransactionId;

/**
 *  Action that indicates that a command was successfully sent.
 * @param id Unique identifier for the transaction from the corresponding "send" command.
 */
export function didSendCommand(id: number): BlePybricksServiceCommandDidSendAction {
    return { type: BlePybricksServiceCommandActionType.DidSend, id };
}

/**
 *  Action that indicates that a command was not sent.
 */
export type BlePybricksServiceCommandDidFailToSendAction =
    Action<BlePybricksServiceCommandActionType.DidFailToSend> &
        TransactionId & {
            /** The error that was raised. */
            err: Error;
        };

/**
 *  Action that indicates that a command was not sent.
 * @param id Unique identifier for the transaction from the corresponding "send" command.
 * @param err The error that was raised.
 */
export function didFailToSendCommand(
    id: number,
    err: Error,
): BlePybricksServiceCommandDidFailToSendAction {
    return { type: BlePybricksServiceCommandActionType.DidFailToSend, id, err };
}

/** Common type for Pybricks control characteristic send command actions. */
export type BlePybricksServiceCommandAction =
    | BlePybricksServiceCommandSendStopUserProgram
    | BlePybricksServiceCommandDidSendAction
    | BlePybricksServiceCommandDidFailToSendAction;

/** Action types for events received from the Pybricks service control characteristic. */
export enum BlePybricksServiceEventActionType {
    /** A status report event was received. */
    DidReceiveStatusReport = 'blePybricksServiceEvent.action.didReceiveStatusReport',
    /** A pseudo-event indicating there was a protocol error (not directly received from the hub). */
    ProtocolError = 'blePybricksServiceEvent.action.protocolError',
}

/**
 * Action that represents a status report event received from the hub.
 */
export type BlePybricksServiceEventStatusReportAction =
    Action<BlePybricksServiceEventActionType.DidReceiveStatusReport> & {
        statusFlags: number;
    };

/**
 * Action that represents a status report event received from the hub.
 * @param statusFlags The status flags.
 */
export function didReceiveStatusReport(
    statusFlags: number,
): BlePybricksServiceEventStatusReportAction {
    return {
        type: BlePybricksServiceEventActionType.DidReceiveStatusReport,
        statusFlags,
    };
}

/**
 * Pseudo-event (not received from hub) indicating that there was a protocol error.
 */
export type BlePybricksServiceEventProtocolErrorAction =
    Action<BlePybricksServiceEventActionType.ProtocolError> & {
        err: Error;
    };

/**
 * Pseudo-event (not received from hub) indicating that there was a protocol error.
 * @param err The error that was caught.
 */
export function eventProtocolError(
    err: Error,
): BlePybricksServiceEventProtocolErrorAction {
    return { type: BlePybricksServiceEventActionType.ProtocolError, err };
}

/** Common type for Pybricks control characteristic event actions. */
export type BlePybricksServiceEventAction =
    | BlePybricksServiceEventStatusReportAction
    | BlePybricksServiceEventProtocolErrorAction;
