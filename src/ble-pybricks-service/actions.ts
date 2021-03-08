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
export type BlePybricksServiceWriteCommandAction = Action<BlePybricksServiceActionType.WriteCommand> & {
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
export type BlePybricksServiceDidWriteCommandAction = Action<BlePybricksServiceActionType.DidWriteCommand> & {
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
export type BlePybricksServiceDidFailToWriteCommandAction = Action<BlePybricksServiceActionType.DidFailToWriteCommand> & {
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
export type BlePybricksServiceDidNotifyEventAction = Action<BlePybricksServiceActionType.DidNotifyEvent> & {
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

/** Action types for events received from the Pybricks service control characteristic. */
export enum BlePybricksServiceEventActionType {
    /** A status report event. */
    StatusReport = 'blePybricksServiceEvent.action.statusReport',
    /** A pseudo-event indicating there was a protocol error (not directly received from the hub). */
    ProtocolError = 'blePybricksServiceEvent.action.protocolError',
}

/**
 * Action that represents a status report event received from the hub.
 */
export type BlePybricksServiceEventStatusReportAction = Action<BlePybricksServiceEventActionType.StatusReport> & {
    statusFlags: number;
};

/**
 * Action that represents a status report event received from the hub.
 * @param statusFlags The status flags.
 */
export function statusReportEvent(
    statusFlags: number,
): BlePybricksServiceEventStatusReportAction {
    return { type: BlePybricksServiceEventActionType.StatusReport, statusFlags };
}

/**
 * Pseudo-event (not received from hub) indicating that there was a protocol error.
 */
export type BlePybricksServiceEventProtocolErrorAction = Action<BlePybricksServiceEventActionType.ProtocolError> & {
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
