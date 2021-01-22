// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { FirmwareReader, FirmwareReaderError, HubType } from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import {
    SagaGenerator,
    all,
    call,
    cancel,
    delay,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { Action } from '../actions';
import {
    FailToStartReasonType,
    FlashFirmwareActionType,
    FlashFirmwareFlashAction,
    MetadataProblem,
    didFailToStart,
    didFinish,
    didProgress,
    didStart,
} from '../actions/flash-firmware';
import {
    BootloaderChecksumResponseAction,
    BootloaderConnectionActionType,
    BootloaderConnectionDidConnectAction,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderDidRequestAction,
    BootloaderDidRequestType,
    BootloaderEraseResponseAction,
    BootloaderErrorResponseAction,
    BootloaderInfoResponseAction,
    BootloaderInitResponseAction,
    BootloaderProgramResponseAction,
    BootloaderResponseAction,
    BootloaderResponseActionType,
    checksumRequest,
    connect,
    disconnectRequest,
    eraseRequest,
    infoRequest,
    initRequest,
    programRequest,
    rebootRequest,
} from '../actions/lwp3-bootloader';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../actions/mpy';
import * as notification from '../actions/notification';
import { MaxProgramFlashSize } from '../protocols/lwp3-bootloader';
import { RootState } from '../reducers';
import { defined, maybe } from '../utils';
import { fmod, sumComplement32 } from '../utils/math';

const firmwareZipMap = new Map<HubType, string>([
    [HubType.CityHub, cityHubZip],
    [HubType.TechnicHub, technicHubZip],
    [HubType.MoveHub, moveHubZip],
]);

function* waitForDidRequest(id: number): SagaGenerator<BootloaderDidRequestAction> {
    return yield* take<BootloaderDidRequestAction>(
        (a: Action) => a.type === BootloaderDidRequestType && a.id === id,
    );
}

/**
 * Waits for a response action, an error response or timeout, whichever comes
 * first.
 * @param type The action type to wait for.
 * @param timeout The timeout in milliseconds.
 */
function* waitForResponse<T extends BootloaderResponseAction>(
    type: BootloaderResponseActionType,
    timeout = 500,
): SagaGenerator<{
    response?: T;
    error?: BootloaderErrorResponseAction;
    timeout?: boolean;
}> {
    return yield* race({
        response: take<T>(type),
        error: take<BootloaderErrorResponseAction>(BootloaderResponseActionType.Error),
        timeout: delay(timeout),
    });
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
 * Loads Pybricks firmware from a .zip file.
 *
 * This can raise didFailToStart() actions, so don't call this after didStart().
 *
 * @param data The zip file raw data
 * @param program User program or `undefined` to use main.py from firmware.zip
 */
function* loadFirmware(
    data: ArrayBuffer,
    program: string | undefined,
): SagaGenerator<{ firmware: Uint8Array; deviceId: HubType }> {
    const [reader, readerErr] = yield* call(() => maybe(FirmwareReader.load(data)));

    if (readerErr) {
        // istanbul ignore else: unexpected error
        if (readerErr instanceof FirmwareReaderError) {
            yield* put(didFailToStart(FailToStartReasonType.ZipError, readerErr));
        } else {
            yield* put(didFailToStart(FailToStartReasonType.Unknown, readerErr));
        }
        yield* cancel();
    }

    defined(reader);

    const firmwareBase = yield* call(() => reader.readFirmwareBase());
    const metadata = yield* call(() => reader.readMetadata());

    // if a user program was not given, then use main.py from the frimware.zip
    if (program === undefined) {
        program = yield* call(() => reader.readMainPy());
    }

    if (metadata['mpy-abi-version'] !== 5) {
        yield* put(
            didFailToStart(
                FailToStartReasonType.BadMetadata,
                'mpy-abi-version',
                MetadataProblem.NotSupported,
            ),
        );
        yield* cancel();
    }

    yield* put(compile(program, metadata['mpy-cross-options']));
    const { mpy, mpyFail } = yield* race({
        mpy: take<MpyDidCompileAction>(MpyActionType.DidCompile),
        mpyFail: take<MpyDidFailToCompileAction>(MpyActionType.DidFailToCompile),
    });

    if (mpyFail) {
        yield* put(didFailToStart(FailToStartReasonType.FailedToCompile));
        yield* cancel();
    }

    defined(mpy);

    // compute offset for checksum - must be aligned to 4-byte boundary
    const checksumOffset =
        metadata['user-mpy-offset'] + 4 + mpy.data.length + fmod(-mpy.data.length, 4);

    const firmware = new Uint8Array(checksumOffset + 4);
    const firmwareView = new DataView(firmware.buffer);

    if (firmware.length > metadata['max-firmware-size']) {
        yield* put(didFailToStart(FailToStartReasonType.FirmwareSize));
        yield* cancel();
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

    return { firmware, deviceId: metadata['device-id'] };
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* flashFirmware(action: FlashFirmwareFlashAction): Generator {
    let firmware: Uint8Array | undefined = undefined;
    let deviceId: HubType | undefined = undefined;

    let program: string | undefined = undefined;

    const flashCurrentProgram = yield* select(
        (s: RootState) => s.settings.flashCurrentProgram,
    );

    if (flashCurrentProgram) {
        const editor = yield* select((s: RootState) => s.editor.current);

        // istanbul ignore if: it is a bug to dispatch this action with no current editor
        if (editor === null) {
            console.error('flashFirmware: No current editor');
            return;
        }

        program = editor.getValue();
    }

    if (action.data !== undefined) {
        ({ firmware, deviceId } = yield* loadFirmware(action.data, program));
    }

    yield* put(connect());
    const connectResult = yield* take<
        | BootloaderConnectionDidConnectAction
        | BootloaderConnectionDidFailToConnectAction
    >([
        BootloaderConnectionActionType.DidConnect,
        BootloaderConnectionActionType.DidFailToConnect,
    ]);

    if (connectResult.type === BootloaderConnectionActionType.DidFailToConnect) {
        return;
    }

    const nextMessageId = yield* getContext<() => number>('nextMessageId');

    const infoAction = yield* put(infoRequest(nextMessageId()));
    const { info } = yield* all({
        sent: waitForDidRequest(infoAction.id),
        info: waitForResponse<BootloaderInfoResponseAction>(
            BootloaderResponseActionType.Info,
        ),
    });
    if (!info.response) {
        throw Error(`failed to get info: ${info}`);
    }

    if (deviceId !== undefined && info.response.hubType !== deviceId) {
        throw Error(
            `Connected to ${info.response.hubType} but firmware is for ${deviceId}`,
        );
    }

    if (firmware === undefined) {
        const firmwarePath = firmwareZipMap.get(info.response.hubType);
        if (firmwarePath === undefined) {
            yield* put(
                notification.add(
                    'error',
                    "Sorry, we don't have firmware for this hub yet.",
                ),
            );
            yield* put(disconnectRequest(nextMessageId()));
            return;
        }

        const response = yield* call(() => fetch(firmwarePath));
        if (!response.ok) {
            yield* put(notification.add('error', 'Failed to fetch firmware.'));
            const disconnectAction = yield* put(disconnectRequest(nextMessageId()));
            yield* waitForDidRequest(disconnectAction.id);
            return;
        }

        const data = yield* call(() => response.arrayBuffer());
        ({ firmware, deviceId } = yield* loadFirmware(data, program));

        if (deviceId !== undefined && info.response.hubType !== deviceId) {
            throw Error(
                `Connected to ${info.response.hubType} but firmware is for ${deviceId}`,
            );
        }
    }

    yield* put(didStart());

    const eraseAction = yield* put(eraseRequest(nextMessageId()));
    const { erase } = yield* all({
        sent: waitForDidRequest(eraseAction.id),
        erase: waitForResponse<BootloaderEraseResponseAction>(
            BootloaderResponseActionType.Erase,
            5000,
        ),
    });
    if (!erase.response || erase.response.result) {
        // TODO: proper error handling
        throw Error(`Failed to erase: ${erase}`);
    }

    const initAction = yield* put(initRequest(nextMessageId(), firmware.length));
    const { init } = yield* all({
        sent: waitForDidRequest(initAction.id),
        init: waitForResponse<BootloaderInitResponseAction>(
            BootloaderResponseActionType.Init,
        ),
    });
    if (!init.response || init.response.result) {
        // TODO: proper error handling
        throw Error(`Failed to init: ${init}`);
    }

    // 14 is "safe" size for all hubs
    const maxDataSize = MaxProgramFlashSize.get(info.response.hubType) || 14;

    for (let count = 1, offset = 0; ; count++) {
        const payload = firmware.slice(offset, offset + maxDataSize);
        const programAction = yield* put(
            programRequest(
                nextMessageId(),
                info.response.startAddress + offset,
                payload.buffer,
            ),
        );
        yield* waitForDidRequest(programAction.id);

        yield* put(didProgress(offset / firmware.length));

        // we don't want to request checksum if this is the last packet since
        // the bootloader will send a response to the program request already.
        offset += maxDataSize;
        if (offset >= firmware.length) {
            break;
        }

        // Request checksum every 10 packets to prevent buffer overrun on
        // the hub because of sending too much data at once. The actual
        // number of packets that can be queued in the Bluetooth chip on
        // the hub is not known and could vary by device.
        if (count % 10 === 0) {
            const checksumAction = yield* put(checksumRequest(nextMessageId()));
            const { checksum } = yield* all({
                sent: waitForDidRequest(checksumAction.id),
                checksum: waitForResponse<BootloaderChecksumResponseAction>(
                    BootloaderResponseActionType.Checksum,
                    5000,
                ),
            });
            if (!checksum.response) {
                // TODO: proper error handling
                throw Error(`Failed to get checksum: ${checksum}`);
            }
        }
    }

    const flash = yield* waitForResponse<BootloaderProgramResponseAction>(
        BootloaderResponseActionType.Program,
        5000,
    );
    if (!flash.response) {
        throw Error(`failed to get final response: ${flash}`);
    }
    if (flash.response.count !== firmware.length) {
        // TODO: proper error handling
        throw Error("Didn't flash all bytes");
    }

    yield* put(didProgress(1));

    // this will cause the remote device to disconnect and reboot
    const rebootAction = yield* put(rebootRequest(nextMessageId()));
    yield* waitForDidRequest(rebootAction.id);

    yield* put(didFinish());
}

export default function* (): Generator {
    yield* takeEvery(FlashFirmwareActionType.FlashFirmware, flashFirmware);
}
