// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2025 The Pybricks Authors
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
    didReceiveWriteAppData,
    didReceiveWriteStdout,
    didSendCommand,
    didWriteCommand,
    eventProtocolError,
    sendLegacyStartReplCommand,
    sendLegacyStartUserProgramCommand,
    sendStartUserProgramCommand,
    sendStopUserProgramCommand,
    sendWriteAppDataCommand,
    sendWriteStdinCommand,
    sendWriteUserProgramMetaCommand,
    sendWriteUserRamCommand,
    writeCommand,
} from './actions';
import {
    EventType,
    ProtocolError,
    createLegacyStartReplCommand,
    createLegacyStartUserProgramCommand,
    createStartUserProgramCommand,
    createStopUserProgramCommand,
    createWriteAppDataCommand,
    createWriteStdinCommand,
    createWriteUserProgramMetaCommand,
    createWriteUserRamCommand,
    getEventType,
    parseStatusReport,
    parseWriteAppData,
    parseWriteStdout,
} from './protocol';

/**
 * Converts a request action into bytecodes and creates a new action to send
 * the bytecodes to to the device.
 */
function* encodeRequest(): Generator {
    // Using a loop to serialize sending data to avoid "busy" errors.

    const chan = yield* actionChannel(
        (a: AnyAction) =>
            typeof a.type === 'string' &&
            a.type.startsWith('blePybricksServiceCommand.action.send'),
    );

    for (;;) {
        const action = yield* take(chan);

        /* istanbul ignore else: should not be possible to reach */
        if (sendStopUserProgramCommand.matches(action)) {
            yield* put(writeCommand(action.id, createStopUserProgramCommand()));
        } else if (sendLegacyStartUserProgramCommand.matches(action)) {
            yield* put(writeCommand(action.id, createLegacyStartUserProgramCommand()));
        } else if (sendLegacyStartReplCommand.matches(action)) {
            yield* put(writeCommand(action.id, createLegacyStartReplCommand()));
        } else if (sendStartUserProgramCommand.matches(action)) {
            yield* put(
                writeCommand(action.id, createStartUserProgramCommand(action.progId)),
            );
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
        } else if (sendWriteStdinCommand.matches(action)) {
            yield* put(
                writeCommand(action.id, createWriteStdinCommand(action.payload)),
            );
        } else if (sendWriteAppDataCommand.matches(action)) {
            yield* put(
                writeCommand(
                    action.id,
                    createWriteAppDataCommand(action.offset, action.payload),
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
            case EventType.StatusReport: {
                const status = parseStatusReport(action.value);
                yield* put(
                    didReceiveStatusReport(
                        status.flags,
                        status.runningProgId,
                        status.selectedSlot,
                    ),
                );
                break;
            }
            case EventType.WriteStdout:
                yield* put(didReceiveWriteStdout(parseWriteStdout(action.value)));
                break;
            case EventType.WriteAppData:
                yield* put(didReceiveWriteAppData(parseWriteAppData(action.value)));
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
