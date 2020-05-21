import JSZip from 'jszip';
import { Action } from 'redux';
import { Channel, buffers } from 'redux-saga';
import {
    Effect,
    actionChannel,
    call,
    delay,
    fork,
    put,
    putResolve,
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
    errorResponse,
    infoRequest,
    infoResponse,
    initRequest,
    initResponse,
    programRequest,
    programResponse,
    progress,
    rebootRequest,
    send,
    stateResponse,
} from '../actions/bootloader';
import { MpyCompiledAction, compile } from '../actions/mpy';
import {
    Command,
    ErrorBytecode,
    HubType,
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
    parseErrorResponse,
    parseGetChecksumResponse,
    parseGetFlashStateResponse,
    parseGetInfoResponse,
    parseInitLoaderResponse,
    parseProgramFlashResponse,
} from '../protocols/bootloader';
import { fmod, sumComplement32 } from '../utils/math';

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
            /* istanbul ignore next: should not be possible to reach */
            default:
                console.error(`Unknown bootloader request action ${action}`);
                continue;
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
            yield put(errorResponse(parseErrorResponse(action.data)));
            break;
        /* istanbul ignore next: should not be possible to reach */
        default:
            console.error(`Unknown bootloader response action ${action}`);
            break;
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

interface FirmwareMetadata {
    'metadata-version': string;
    'firmware-version': string;
    'device-id': HubType;
    'checksum-type': 'sum' | 'crc32';
    'mpy-abi-version': number;
    'mpy-cross-options': string[];
    'user-mpy-offset': number;
    'max-firmware-size': number;
}

function* firmwareIterator(data: DataView, maxSize: number): Generator<number> {
    // read each 32-bit word of the firmware
    for (let i = 0; i < data.byteLength; i += 4) {
        yield data.getUint32(i, true);
    }
    // remaining free space in flash will be 0xff after erase
    for (let i = data.byteLength; i < maxSize; i += 4) {
        yield ~0;
    }
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* flashFirmware(action: BootloaderFlashFirmwareAction): Generator {
    const zip = (yield call(() => JSZip().loadAsync(action.data))) as JSZip;
    const firmwareBase = (yield call(() =>
        zip.file('firmware-base.bin').async('uint8array'),
    )) as Uint8Array;
    const metadata = JSON.parse(
        (yield call(() => zip.file('firmware.metadata.json').async('text'))) as string,
    ) as FirmwareMetadata;
    const main = (yield call(() => zip.file('main.py').async('text'))) as string;

    if (metadata['mpy-abi-version'] !== 4) {
        throw Error(
            `Firmware requires mpy-cross ABI version ${metadata['mpy-abi-version']} we have v4`,
        );
    }

    const mpy = (yield putResolve(
        (compile(main, metadata['mpy-cross-options']) as unknown) as Action,
    )) as MpyCompiledAction;

    if (!mpy.data) {
        throw Error(mpy.err);
    }

    // compute offset for checksum - must be aligned to 4-byte boundary
    const checksumOffset =
        metadata['user-mpy-offset'] + 4 + mpy.data.length + fmod(-mpy.data.length, 4);

    const firmware = new Uint8Array(checksumOffset + 4);
    const firmwareView = new DataView(firmware.buffer);

    if (firmware.length > metadata['max-firmware-size']) {
        throw Error('firmware + main.mpy is too large');
    }

    firmware.set(firmwareBase);
    firmwareView.setUint32(metadata['user-mpy-offset'], mpy.data.length, true);
    firmware.set(mpy.data, metadata['user-mpy-offset'] + 4);

    if (metadata['checksum-type'] !== 'sum') {
        throw Error(`Unknown checksum type "${metadata['checksum-type']}"`);
    }

    firmwareView.setUint32(
        checksumOffset,
        sumComplement32(firmwareIterator(firmwareView, metadata['max-firmware-size'])),
        true,
    );

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

    if (info[0].hubType !== metadata['device-id']) {
        throw Error(
            `Connected to ${info[0].hubType} but firmware is for ${metadata['device-id']}`,
        );
    }

    yield put(eraseRequest());
    const erase = (yield wait(
        BootloaderResponseActionType.Erase,
        5000,
    )) as WaitResponse<BootloaderEraseResponseAction>;
    if (!erase[0] || erase[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to erase: ${erase}`);
    }

    yield put(initRequest(firmware.length));
    const init = (yield wait(BootloaderResponseActionType.Init)) as WaitResponse<
        BootloaderInitResponseAction
    >;
    if (!init[0] || init[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to init: ${init}`);
    }

    let count = 0;

    for (let offset = 0; offset < firmware.length; offset += MaxProgramFlashSize) {
        const payload = firmware.slice(offset, offset + MaxProgramFlashSize);
        yield put(programRequest(info[0].startAddress + offset, payload.buffer));

        // TODO: wait for request to actually be sent before reporting progress
        yield put(progress(offset, firmware.length));

        // TODO: we can skip getting the checksum when canWriteWithoutResponse === false
        // when the todo above is done.

        // request checksum every 8K to prevent buffer overrun on the hub
        // because of sending too much data at once
        if (++count % 585 === 0) {
            yield put(checksumRequest());
            const checksum = (yield wait(
                BootloaderResponseActionType.Checksum,
                didConnect.canWriteWithoutResponse ? 5000 : 60000,
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
    if (flash[0].count !== firmware.length) {
        // TODO: proper error handling
        throw Error("Didn't flash all bytes");
    }

    yield put(progress(firmware.length, firmware.length));

    // this will cause the remote device to disconnect and reboot
    yield put(rebootRequest());
}

export default function* (): Generator {
    yield fork(encodeRequest);
    yield takeEvery(BootloaderConnectionActionType.DidReceive, decodeResponse);
    yield takeEvery(BootloaderActionType.FlashFirmware, flashFirmware);
}
