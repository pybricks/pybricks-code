// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
//
// Handles Pybricks protocol.

import {
    actionChannel,
    fork,
    put,
    race,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { Action } from '../actions';
import { ensureError, hex } from '../utils';
import {
    BlePybricksServiceActionType,
    BlePybricksServiceCommandAction,
    BlePybricksServiceCommandActionType,
    BlePybricksServiceDidFailToWriteCommandAction,
    BlePybricksServiceDidNotifyEventAction,
    BlePybricksServiceDidWriteCommandAction,
    didFailToSendCommand,
    didSendCommand,
    eventProtocolError,
    statusReportEvent,
    writeCommand,
} from './actions';
import {
    EventType,
    ProtocolError,
    createStopUserProgramCommand,
    getEventType,
    parseStatusReport,
} from './protocol';

/**
 * Converts a request action into bytecodes and creates a new action to send
 * the bytecodes to to the device.
 */
function* encodeRequest(): Generator {
    // Using a while loop to serialize sending data to avoid "busy" errors.

    const sendCommands: readonly BlePybricksServiceCommandActionType[] = Object.values(
        BlePybricksServiceCommandActionType,
    ).filter(
        (x) =>
            x !== BlePybricksServiceCommandActionType.DidSend &&
            x != BlePybricksServiceCommandActionType.DidFailToSend,
    );

    const chan = yield* actionChannel<BlePybricksServiceCommandAction>((a: Action) =>
        sendCommands.includes(a.type as BlePybricksServiceCommandActionType),
    );

    while (true) {
        const action = yield* take(chan);

        switch (action.type) {
            case BlePybricksServiceCommandActionType.SendStopUserProgram:
                yield* put(writeCommand(action.id, createStopUserProgramCommand()));
                break;
            /* istanbul ignore next: should not be possible to reach */
            default:
                console.error(`Unknown Pybricks service command ${action.type}`);
                continue;
        }

        const { failedToSend } = yield* race({
            sent: take<BlePybricksServiceDidWriteCommandAction>(
                BlePybricksServiceActionType.DidWriteCommand,
            ),
            failedToSend: take<BlePybricksServiceDidFailToWriteCommandAction>(
                BlePybricksServiceActionType.DidFailToWriteCommand,
            ),
        });

        if (failedToSend) {
            yield* put(didFailToSendCommand(action.id, failedToSend.err));
        } else {
            yield* put(didSendCommand(action.id));
        }
    }
}

/**
 * Converts an incoming connection message to a response action.
 * @param action The received response action.
 */
function* decodeResponse(action: BlePybricksServiceDidNotifyEventAction): Generator {
    try {
        const responseType = getEventType(action.value);
        switch (responseType) {
            case EventType.StatusReport:
                yield* put(statusReportEvent(parseStatusReport(action.value)));
                break;
            default:
                throw new ProtocolError(
                    `unknown pybricks event type: ${hex(responseType, 2)}`,
                    action.value,
                );
        }
    } catch (err) {
        yield* put(eventProtocolError(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* fork(encodeRequest);
    yield* takeEvery(BlePybricksServiceActionType.DidNotifyEvent, decodeResponse);
}
