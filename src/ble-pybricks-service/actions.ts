// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors
//
// Actions for Bluetooth Low Energy Pybricks service

import { createAction } from '../actions';
import { PnpId } from '../ble-device-info-service/protocol';

// Low-level connection actions.

/**
 * Action that request to write a command to the Pybricks service control characteristic.
 */
export const writeCommand = createAction((id: number, value: Uint8Array) => ({
    type: 'blePybricksService.action.writeCommand',
    id,
    value,
}));

/**
 * Action that indicates sending a command to the Pybricks service control characteristic was successful.
 */
export const didWriteCommand = createAction((id: number) => ({
    type: 'blePybricksService.action.didWriteCommand',
    id,
}));

/**
 * Action that indicates sending a command to the Pybricks service control characteristic failed.
 */
export const didFailToWriteCommand = createAction((id: number, err: Error) => ({
    type: 'blePybricksService.action.didFailToWriteCommand',
    id,
    err,
}));

/**
 * Action that indicates an event notification was received on the Pybricks service control characteristic.
 */
export const didNotifyEvent = createAction((value: DataView) => ({
    type: 'blePybricksService.action.didNotifyEvent',
    value,
}));

/** Action types for commands sent via the Pybricks service control characteristic. */

/**
 * Action that requests a stop user program to be sent.
 * @param id Unique identifier for this transaction.
 */
export const sendStopUserProgramCommand = createAction((id: number) => ({
    type: 'blePybricksServiceCommand.action.sendStopUserProgram',
    id,
}));

/**
 * Action that requests a start user program to be sent.
 * @param id Unique identifier for this transaction.
 */
export const sendStartUserProgramCommand = createAction((id: number) => ({
    type: 'blePybricksServiceCommand.action.sendStartUserProgram',
    id,
}));

/**
 * Action that requests a start interactive REPL to be sent.
 * @param id Unique identifier for this transaction.
 */
export const sendStartReplCommand = createAction((id: number) => ({
    type: 'blePybricksServiceCommand.action.sendStartRepl',
    id,
}));

/**
 * Action that requests to write user program metadata.
 * @param id Unique identifier for this transaction.
 * @param size The size of the user program in bytes.
 */
export const sendWriteUserProgramMetaCommand = createAction(
    (id: number, size: number) => ({
        type: 'blePybricksServiceCommand.action.sendWriteUserProgramMeta',
        id,
        size,
    }),
);

/**
 * Action that requests to write to user RAM.
 * @param id Unique identifier for this transaction.
 * @param offset The offset in bytes from the user RAM base address.
 * @param payload The bytes to write.
 */
export const sendWriteUserRamCommand = createAction(
    (id: number, offset: number, payload: ArrayBuffer) => ({
        type: 'blePybricksServiceCommand.action.sendWriteUserRamCommand',
        id,
        offset,
        payload,
    }),
);

/**
 *  Action that indicates that a command was successfully sent.
 * @param id Unique identifier for the transaction from the corresponding "send" command.
 */
export const didSendCommand = createAction((id: number) => ({
    type: 'blePybricksServiceCommand.action.didSend',
    id,
}));

/**
 *  Action that indicates that a command was not sent.
 * @param id Unique identifier for the transaction from the corresponding "send" command.
 * @param err The error that was raised.
 */
export const didFailToSendCommand = createAction((id: number, err: Error) => ({
    type: 'blePybricksServiceCommand.action.didFailToSend',
    id,
    err,
}));

/** Action types for events received from the Pybricks service control characteristic. */

/**
 * Action that represents a status report event received from the hub.
 * @param statusFlags The status flags.
 */
export const didReceiveStatusReport = createAction((statusFlags: number) => ({
    type: 'blePybricksServiceEvent.action.didReceiveStatusReport',
    statusFlags,
}));

/**
 * Pseudo-event  = actionCreator((not received from hub) indicating that there was a protocol error.
 * @param err The error that was caught.
 */
export const eventProtocolError = createAction((err: Error) => ({
    type: 'blePybricksServiceEvent.action.protocolError',
    err,
}));

/**
 * Action that is called when the Pybricks Hub Capbailities characteristic
 * is read.
 */
export const blePybricksServiceDidReceiveHubCapabilities = createAction(
    (maxWriteSize: number, flags: number, maxUserProgramSize: number) => ({
        type: 'blePybricksServiceEvent.action.didReceiveHubCapabilities',
        maxWriteSize,
        flags,
        maxUserProgramSize,
    }),
);

/**
 * For compatibility with older firmware that does not have Pybricks Hub
 * Capabilities characteristic.
 */
export const blePybricksServiceDidNotReceiveHubCapabilities = createAction(
    (pnpId: PnpId, firmwareVersion: string) => ({
        type: 'blePybricksServiceEvent.action.didNotReceiveHubCapabilities',
        pnpId,
        firmwareVersion,
    }),
);
