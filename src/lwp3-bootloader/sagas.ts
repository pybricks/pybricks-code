// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors
//
// Handles LEGO Wireless Protocol v3 Bootloader protocol.

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
import { isWindows } from '../utils/os';
import {
    checksumRequest,
    checksumResponse,
    didError,
    didFailToRequest,
    didFailToSend,
    didReceive,
    didRequest,
    didSend,
    disconnectRequest,
    eraseRequest,
    eraseResponse,
    errorResponse,
    infoRequest,
    infoResponse,
    initRequest,
    initResponse,
    programRequest,
    programResponse,
    rebootRequest,
    send,
    stateRequest,
    stateResponse,
} from './actions';
import {
    Command,
    ErrorBytecode,
    ProtocolError,
    createDisconnectRequest,
    createEraseFlashRequest,
    createGetChecksumRequest,
    createGetFlashStateRequest,
    createGetInfoRequest,
    createInitLoaderRequest,
    createProgramFlashRequest,
    createStartAppRequest,
    getMessageType,
    parseEraseFlashResponse,
    parseErrorResponse,
    parseGetChecksumResponse,
    parseGetFlashStateResponse,
    parseGetInfoResponse,
    parseInitLoaderResponse,
    parseProgramFlashResponse,
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
            a.type.startsWith('bootloader.action.request.'),
    );

    while (true) {
        const action = yield* take(chan);

        // NB: Commands other than program on city hub will cause BlueZ to
        // disconnect because they will send a response even if we write without
        // response, so we always write with response on those commands. The
        // program command needs to be write without response for performance
        // reasons (and also the city hub will disconnect if write with response
        // is used on this command).

        /* istanbul ignore else: should not be possible to reach */
        if (eraseRequest.matches(action)) {
            yield* put(
                send(
                    createEraseFlashRequest(),
                    /* withResponse */ action.isCityHub && !isWindows(),
                ),
            );
        } else if (programRequest.matches(action)) {
            yield* put(
                send(
                    createProgramFlashRequest(action.address, action.payload),
                    /* withResponse */ false,
                ),
            );
        } else if (rebootRequest.matches(action)) {
            yield* put(send(createStartAppRequest(), /* withResponse */ false));
        } else if (initRequest.matches(action)) {
            yield* put(send(createInitLoaderRequest(action.firmwareSize)));
        } else if (infoRequest.matches(action)) {
            yield* put(send(createGetInfoRequest()));
        } else if (checksumRequest.matches(action)) {
            yield* put(send(createGetChecksumRequest()));
        } else if (stateRequest.matches(action)) {
            yield* put(send(createGetFlashStateRequest()));
        } else if (disconnectRequest.matches(action)) {
            yield* put(send(createDisconnectRequest(), /* withResponse */ false));
        } else {
            console.error(`Unknown bootloader request action ${action}`);
            continue;
        }

        const { failedToSend } = yield* race({
            sent: take(didSend),
            failedToSend: take(didFailToSend),
        });

        if (failedToSend) {
            yield* put(didFailToRequest(action.id, failedToSend.err));
        } else {
            yield* put(didRequest(action.id));
        }
    }
}

/**
 * Converts an incoming connection message to a response action.
 * @param action The received response action.
 */
function* decodeResponse(action: ReturnType<typeof didReceive>): Generator {
    try {
        const responseType = getMessageType(action.data);
        switch (responseType) {
            case Command.EraseFlash:
                yield* put(eraseResponse(parseEraseFlashResponse(action.data)));
                break;
            case Command.ProgramFlash:
                yield* put(programResponse(...parseProgramFlashResponse(action.data)));
                break;
            case Command.InitLoader:
                yield* put(initResponse(parseInitLoaderResponse(action.data)));
                break;
            case Command.GetInfo:
                yield* put(infoResponse(...parseGetInfoResponse(action.data)));
                break;
            case Command.GetChecksum:
                yield* put(checksumResponse(parseGetChecksumResponse(action.data)));
                break;
            case Command.GetFlashState:
                yield* put(stateResponse(parseGetFlashStateResponse(action.data)));
                break;
            case ErrorBytecode:
                yield* put(errorResponse(parseErrorResponse(action.data)));
                break;
            default:
                throw new ProtocolError(
                    `unknown bootloader response type: ${hex(responseType, 2)}`,
                    action.data,
                );
        }
    } catch (err) {
        yield* put(didError(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* fork(encodeRequest);
    yield* takeEvery(didReceive, decodeResponse);
}
