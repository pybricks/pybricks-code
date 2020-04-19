import { Action } from 'redux';
import { Channel, buffers } from 'redux-saga';
import {
    Effect,
    actionChannel,
    delay,
    fork,
    put,
    race,
    take,
    takeEvery,
} from 'redux-saga/effects';
import {
    BootloaderActionType,
    BootloaderChecksumResponseAction,
    BootloaderConnectionActionType,
    BootloaderConnectionDidCancelAction,
    BootloaderConnectionDidConnectAction,
    BootloaderConnectionDidErrorAction,
    BootloaderConnectionDidReceiveAction,
    BootloaderEraseResponseAction,
    BootloaderErrorResponseAction,
    BootloaderFlashFirmwareAction,
    BootloaderInfoResponseAction,
    BootloaderInitResponseAction,
    BootloaderProgramResponseAction,
    BootloaderRequestAction,
    BootloaderRequestActionType,
    BootloaderResponseActionType,
    checksumRequest,
    checksumResponse,
    connect,
    eraseRequest,
    eraseResponse,
    infoRequest,
    infoResponse,
    initRequest,
    initResponse,
    programRequest,
    programResponse,
    rebootRequest,
    send,
    stateResponse,
} from '../actions/bootloader';
import {
    Command,
    ErrorBytecode,
    MaxProgramFlashSize,
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
    parseGetChecksumResponse,
    parseGetFlashStateResponse,
    parseGetInfoResponse,
    parseInitLoaderResponse,
    parseProgramFlashResponse,
} from '../protocols/bootloader';

/**
 * Converts a request action into bytecodes and creates a new action to send
 * the bytecodes to to the device.
 * @param action The request action that was observed.
 */
function* encodeRequest(): Generator {
    // Using a while loop to serialize sending data to avoid "busy" errors.

    const chan = (yield actionChannel(
        (a: Action) => Object.values(BootloaderRequestActionType).includes(a.type),
        buffers.expanding(),
    )) as Channel<BootloaderRequestAction>;
    while (true) {
        const action = (yield take(chan)) as BootloaderRequestAction;

        switch (action.type) {
            case BootloaderRequestActionType.Erase:
                yield put(send(createEraseFlashRequest()));
                break;
            case BootloaderRequestActionType.Program:
                yield put(
                    send(createProgramFlashRequest(action.address, action.payload)),
                );
                break;
            case BootloaderRequestActionType.Reboot:
                yield put(send(createStartAppRequest()));
                break;
            case BootloaderRequestActionType.Init:
                yield put(send(createInitLoaderRequest(action.firmwareSize)));
                break;
            case BootloaderRequestActionType.Info:
                yield put(send(createGetInfoRequest()));
                break;
            case BootloaderRequestActionType.Checksum:
                yield put(send(createGetChecksumRequest()));
                break;
            case BootloaderRequestActionType.State:
                yield put(send(createGetFlashStateRequest()));
                break;
            case BootloaderRequestActionType.Disconnect:
                yield put(send(createDisconnectRequest()));
                break;
            default:
                console.error(`Unknown bootloader request action ${action}`);
                break;
        }

        yield take(BootloaderConnectionActionType.DidSend);
    }
}

/**
 * Converts an incoming connection message to a response action.
 * @param action The received response action.
 */
function* decodeResponse(action: BootloaderConnectionDidReceiveAction): Generator {
    const responseType = getMessageType(action.data);
    switch (responseType) {
        case Command.EraseFlash:
            yield put(eraseResponse(parseEraseFlashResponse(action.data)));
            break;
        case Command.ProgramFlash:
            yield put(programResponse(...parseProgramFlashResponse(action.data)));
            break;
        case Command.InitLoader:
            yield put(initResponse(parseInitLoaderResponse(action.data)));
            break;
        case Command.GetInfo:
            yield put(infoResponse(...parseGetInfoResponse(action.data)));
            break;
        case Command.GetChecksum:
            yield put(checksumResponse(parseGetChecksumResponse(action.data)));
            break;
        case Command.GetFlashState:
            yield put(stateResponse(parseGetFlashStateResponse(action.data)));
            break;
        case ErrorBytecode:
            yield put(stateResponse(parseGetFlashStateResponse(action.data)));
            break;
        default:
            console.error(`Unknown bootloader response action ${action}`);
    }
}

/**
 * Helper type for return value of wait() function.
 */
type WaitResponse<T extends Action<BootloaderResponseActionType>> = [
    T,
    BootloaderErrorResponseAction,
    boolean,
];

/**
 * Waits for a response action, an error response or timeout, whichever comes
 * first.
 * @param type The action type to wait for.
 * @param timeout The timeout in milliseconds.
 */
function wait(type: BootloaderResponseActionType, timeout = 500): Effect {
    return race([take(type), take(BootloaderResponseActionType.Error), delay(timeout)]);
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* flashFirmware(action: BootloaderFlashFirmwareAction): Generator {
    yield put(connect());
    const didConnect = (yield take([
        BootloaderConnectionActionType.DidConnect,
        BootloaderConnectionActionType.DidCancel,
        BootloaderConnectionActionType.DidError,
    ])) as
        | BootloaderConnectionDidConnectAction
        | BootloaderConnectionDidCancelAction
        | BootloaderConnectionDidErrorAction;

    if (didConnect.type === BootloaderConnectionActionType.DidCancel) {
        return;
    }

    if (didConnect.type === BootloaderConnectionActionType.DidError) {
        // TODO: proper error handling
        throw didConnect.err;
    }

    yield put(infoRequest());
    const info = (yield wait(BootloaderResponseActionType.Info)) as WaitResponse<
        BootloaderInfoResponseAction
    >;
    if (!info[0]) {
        throw Error(`failed to get info: ${info}`);
    }

    // TODO: verify hubType === info.response.hubType

    yield put(eraseRequest());
    const erase = (yield wait(
        BootloaderResponseActionType.Erase,
        5000,
    )) as WaitResponse<BootloaderEraseResponseAction>;
    if (!erase[0] || erase[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to erase: ${erase}`);
    }

    yield put(initRequest(action.data.byteLength));
    const init = (yield wait(BootloaderResponseActionType.Init)) as WaitResponse<
        BootloaderInitResponseAction
    >;
    if (!init[0] || init[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to init: ${init}`);
    }

    let count = 0;

    for (
        let offset = 0;
        offset < action.data.byteLength;
        offset += MaxProgramFlashSize
    ) {
        const payload = action.data.slice(offset, offset + MaxProgramFlashSize);
        yield put(programRequest(info[0].startAddress + offset, payload));

        // TODO: dispatch progress action

        // request checksum every so often to prevent buffer overrun on the hub
        // because of sending too much data at once
        if (++count % 10 === 0) {
            yield put(checksumRequest());
            const checksum = (yield wait(
                BootloaderResponseActionType.Checksum,
                5000,
            )) as WaitResponse<BootloaderChecksumResponseAction>;
            if (!checksum[0]) {
                // TODO: proper error handling
                throw Error(`Failed to get checksum: ${checksum}`);
            }
        }
    }

    const flash = (yield wait(
        BootloaderResponseActionType.Program,
        5000,
    )) as WaitResponse<BootloaderProgramResponseAction>;
    if (!flash[0]) {
        throw Error(`failed to get final response: ${flash}`);
    }
    if (flash[0].count !== action.data.byteLength) {
        // TODO: proper error handling
        throw Error("Didn't flash all bytes");
    }

    // this will cause the remote device to disconnect and reboot
    yield put(rebootRequest());
}

export default function* (): Generator {
    yield fork(encodeRequest);
    yield takeEvery(BootloaderConnectionActionType.DidReceive, decodeResponse);
    yield takeEvery(BootloaderActionType.FlashFirmware, flashFirmware);
}
