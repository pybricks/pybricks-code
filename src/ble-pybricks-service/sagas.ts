// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
//
// Handles Pybricks protocol.

import { put, takeEvery } from 'typed-redux-saga/macro';
import { hex } from '../utils';
import {
    BlePybricksServiceActionType,
    BlePybricksServiceDidNotifyEventAction,
    eventProtocolError,
    statusReportEvent,
} from './actions';
import { EventType, ProtocolError, getEventType, parseStatusReport } from './protocol';

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
        yield* put(eventProtocolError(err));
    }
}

export default function* (): Generator {
    yield* takeEvery(BlePybricksServiceActionType.DidNotifyEvent, decodeResponse);
}
