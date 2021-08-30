// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
//
// Handles LEGO Wireless Protocol v3 Bootloader protocol.

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
import { isWindows } from '../utils/os';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionDidFailToSendAction,
    BootloaderConnectionDidReceiveAction,
    BootloaderConnectionDidSendAction,
    BootloaderRequestAction,
    BootloaderRequestActionType,
    checksumResponse,
    didError,
    didFailToRequest,
    didRequest,
    eraseResponse,
    errorResponse,
    infoResponse,
    initResponse,
    programResponse,
    send,
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

    const chan = yield* actionChannel<BootloaderRequestAction>((a: Action) =>
        Object.values(BootloaderRequestActionType).includes(
            a.type as BootloaderRequestActionType,
        ),
    );

    while (true) {
        const action = yield* take(chan);

        // NB: Commands other than program on city hub will cause BlueZ to
        // disconnect because they will send a response even if we write without
        // response, so we always write with response on those commands. The
        // program command needs to be write without response for performance
        // reasons (and also the city hub will disconnect if write with response
        // is used on this command).

        switch (action.type) {
            case BootloaderRequestActionType.Erase:
                yield* put(
                    send(
                        createEraseFlashRequest(),
                        /* withResponse */ action.isCityHub && !isWindows(),
                    ),
                );
                break;
            case BootloaderRequestActionType.Program:
                yield* put(
                    send(
                        createProgramFlashRequest(action.address, action.payload),
                        /* withResponse */ false,
                    ),
                );
                break;
            case BootloaderRequestActionType.Reboot:
                yield* put(send(createStartAppRequest(), /* withResponse */ false));
                break;
            case BootloaderRequestActionType.Init:
                yield* put(send(createInitLoaderRequest(action.firmwareSize)));
                break;
            case BootloaderRequestActionType.Info:
                yield* put(send(createGetInfoRequest()));
                break;
            case BootloaderRequestActionType.Checksum:
                yield* put(send(createGetChecksumRequest()));
                break;
            case BootloaderRequestActionType.State:
                yield* put(send(createGetFlashStateRequest()));
                break;
            case BootloaderRequestActionType.Disconnect:
                yield* put(send(createDisconnectRequest(), /* withResponse */ false));
                break;
            /* istanbul ignore next: should not be possible to reach */
            default:
                console.error(`Unknown bootloader request action ${action}`);
                continue;
        }

        const { failedToSend } = yield* race({
            sent: take<BootloaderConnectionDidSendAction>(
                BootloaderConnectionActionType.DidSend,
            ),
            failedToSend: take<BootloaderConnectionDidFailToSendAction>(
                BootloaderConnectionActionType.DidFailToSend,
            ),
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
function* decodeResponse(action: BootloaderConnectionDidReceiveAction): Generator {
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
    yield* takeEvery(BootloaderConnectionActionType.DidReceive, decodeResponse);
}
