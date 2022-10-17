// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors
//
// Handles Pybricks protocol.

import { AnyAction } from 'redux';
import {
    actionChannel,
    fork,
    put,
    race,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { ensureError, hex } from '../utils';
import {
    didFailToSendCommand,
    didFailToWriteCommand,
    didNotifyEvent,
    didReceiveStatusReport,
    didSendCommand,
    didWriteCommand,
    eventProtocolError,
    sendStartReplCommand,
    sendStartUserProgramCommand,
    sendStopUserProgramCommand,
    sendWriteUserProgramMetaCommand,
    sendWriteUserRamCommand,
    writeCommand,
} from './actions';
import {
    EventType,
    ProtocolError,
    createStartReplCommand,
    createStartUserProgramCommand,
    createStopUserProgramCommand,
    createWriteUserProgramMetaCommand,
    createWriteUserRamCommand,
    getEventType,
    parseStatusReport,
} from './protocol';

/**
 * Converts a request action into bytecodes and creates a new action to send
 * the bytecodes to to the device.
 */
function* encodeRequest(): Generator {
    // Using a while loop to serialize sending data to avoid "busy" errors.

    const chan = yield* actionChannel(
        (a: AnyAction) =>
            typeof a.type === 'string' &&
            a.type.startsWith('blePybricksServiceCommand.action.send'),
    );

    while (true) {
        const action = yield* take(chan);

        /* istanbul ignore else: should not be possible to reach */
        if (sendStopUserProgramCommand.matches(action)) {
            yield* put(writeCommand(action.id, createStopUserProgramCommand()));
        } else if (sendStartUserProgramCommand.matches(action)) {
            yield* put(writeCommand(action.id, createStartUserProgramCommand()));
        } else if (sendStartReplCommand.matches(action)) {
            yield* put(writeCommand(action.id, createStartReplCommand()));
        } else if (sendWriteUserProgramMetaCommand.matches(action)) {
            yield* put(
                writeCommand(action.id, createWriteUserProgramMetaCommand(action.size)),
            );
        } else if (sendWriteUserRamCommand.matches(action)) {
            yield* put(
                writeCommand(
                    action.id,
                    createWriteUserRamCommand(action.offset, action.payload),
                ),
            );
        } else {
            console.error(`Unknown Pybricks service command ${action.type}`);
            continue;
        }

        const { failedToSend } = yield* race({
            sent: take(didWriteCommand),
            failedToSend: take(didFailToWriteCommand),
        });

        if (failedToSend) {
            yield* put(didFailToSendCommand(action.id, failedToSend.error));
        } else {
            yield* put(didSendCommand(action.id));
        }
    }
}

/**
 * Converts an incoming connection message to a response action.
 * @param action The received response action.
 */
function* decodeResponse(action: ReturnType<typeof didNotifyEvent>): Generator {
    try {
        const responseType = getEventType(action.value);
        switch (responseType) {
            case EventType.StatusReport:
                yield* put(didReceiveStatusReport(parseStatusReport(action.value)));
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
    yield* takeEvery(didNotifyEvent, decodeResponse);
}
