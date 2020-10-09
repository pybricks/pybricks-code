// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import JSZip from 'jszip';
import {
    Effect,
    all,
    call,
    delay,
    put,
    race,
    take,
    takeEvery,
} from 'redux-saga/effects';
import { Action } from '../actions';
import {
    FlashFirmwareActionType,
    FlashFirmwareFlashAction,
    progress,
} from '../actions/flash-firmware';
import {
    BootloaderChecksumRequestAction,
    BootloaderChecksumResponseAction,
    BootloaderConnectionActionType,
    BootloaderConnectionDidConnectAction,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderDidRequestAction,
    BootloaderDidRequestType,
    BootloaderDisconnectRequestAction,
    BootloaderEraseRequestAction,
    BootloaderEraseResponseAction,
    BootloaderErrorResponseAction,
    BootloaderInfoRequestAction,
    BootloaderInfoResponseAction,
    BootloaderInitRequestAction,
    BootloaderInitResponseAction,
    BootloaderProgramRequestAction,
    BootloaderProgramResponseAction,
    BootloaderRebootRequestAction,
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
import { HubType, MaxProgramFlashSize } from '../protocols/lwp3-bootloader';
import { fmod, sumComplement32 } from '../utils/math';

const firmwareZipMap = new Map<HubType, string>([
    [HubType.CityHub, cityHubZip],
    [HubType.TechnicHub, technicHubZip],
    [HubType.MoveHub, moveHubZip],
]);

/**
 * Helper type for return value of wait() function.
 */
type WaitResponse<T extends BootloaderResponseAction> = [
    T,
    BootloaderErrorResponseAction,
    boolean,
];

function* waitForDidSend(id: number): Generator {
    const didRequest = (yield take(
        (a: Action) =>
            a.type === BootloaderDidRequestType &&
            (a as BootloaderDidRequestAction).id === id,
    )) as BootloaderDidRequestAction;
    if (didRequest.err) {
        console.error(didRequest.err);
    }
    return didRequest;
}

/**
 * Waits for a response action, an error response or timeout, whichever comes
 * first.
 * @param type The action type to wait for.
 * @param timeout The timeout in milliseconds.
 */
function waitForResponse(type: BootloaderResponseActionType, timeout = 500): Effect {
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
 * Loads Pybricks firmware from a .zip file
 * @param data The zip file raw data
 */
function* loadFirmware(
    data: ArrayBuffer,
): Generator<unknown, { firmware: Uint8Array; deviceId: HubType }> {
    const zip = (yield call(() => JSZip.loadAsync(data))) as JSZip;

    const firmwareBaseFile = zip.file('firmware-base.bin');
    if (firmwareBaseFile === null) {
        throw Error('Missing firmware-base.bin');
    }
    const firmwareBase = (yield call(() =>
        firmwareBaseFile.async('uint8array'),
    )) as Uint8Array;

    const metadataFile = zip.file('firmware.metadata.json');
    if (metadataFile === null) {
        throw Error('Missing firmware.metadata.json');
    }
    const metadata = JSON.parse(
        (yield call(() => metadataFile.async('text'))) as string,
    ) as FirmwareMetadata;

    const mainFile = zip.file('main.py');
    if (mainFile === null) {
        throw Error('Missing main.py');
    }
    const main = (yield call(() => mainFile.async('text'))) as string;

    if (metadata['mpy-abi-version'] !== 5) {
        throw Error(
            `Firmware requires mpy-cross ABI version ${metadata['mpy-abi-version']} we have v5`,
        );
    }

    yield put(compile(main, metadata['mpy-cross-options']));
    const [mpy, mpyFail] = (yield race([
        take(MpyActionType.DidCompile),
        take(MpyActionType.DidFailToCompile),
    ])) as [MpyDidCompileAction, MpyDidFailToCompileAction];

    if (mpyFail) {
        throw Error(mpyFail.err);
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

    return { firmware, deviceId: metadata['device-id'] };
}

/**
 * Flashes firmware to a Powered Up device.
 * @param action The action that triggered this saga.
 */
function* flashFirmware(action: FlashFirmwareFlashAction): Generator {
    let firmware: Uint8Array | undefined = undefined;
    let deviceId: HubType | undefined = undefined;

    if (action.data !== undefined) {
        ({ firmware, deviceId } = yield* loadFirmware(action.data));
    }

    yield put(connect());
    const connectResult = (yield take([
        BootloaderConnectionActionType.DidConnect,
        BootloaderConnectionActionType.DidFailToConnect,
    ])) as
        | BootloaderConnectionDidConnectAction
        | BootloaderConnectionDidFailToConnectAction;

    if (connectResult.type === BootloaderConnectionActionType.DidFailToConnect) {
        return;
    }

    const infoAction = (yield put(infoRequest())) as BootloaderInfoRequestAction;
    const [, info] = (yield all([
        waitForDidSend(infoAction.id),
        waitForResponse(BootloaderResponseActionType.Info),
    ])) as [BootloaderDidRequestAction, WaitResponse<BootloaderInfoResponseAction>];
    if (!info[0]) {
        throw Error(`failed to get info: ${info}`);
    }

    if (deviceId !== undefined && info[0].hubType !== deviceId) {
        throw Error(`Connected to ${info[0].hubType} but firmware is for ${deviceId}`);
    }

    if (firmware === undefined) {
        const firmwarePath = firmwareZipMap.get(info[0].hubType);
        if (firmwarePath === undefined) {
            yield put(
                notification.add(
                    'error',
                    "Sorry, we don't have firmware for this hub yet.",
                ),
            );
            yield put(disconnectRequest());
            return;
        }

        const response = (yield call(() => fetch(firmwarePath))) as Response;
        if (!response.ok) {
            yield put(notification.add('error', 'Failed to fetch firmware.'));
            const disconnectAction = (yield put(
                disconnectRequest(),
            )) as BootloaderDisconnectRequestAction;
            yield waitForDidSend(disconnectAction.id);
            return;
        }

        const data = (yield call(() => response.arrayBuffer())) as ArrayBuffer;
        ({ firmware, deviceId } = yield* loadFirmware(data));

        if (deviceId !== undefined && info[0].hubType !== deviceId) {
            throw Error(
                `Connected to ${info[0].hubType} but firmware is for ${deviceId}`,
            );
        }
    }

    // City hub bootloader is buggy. See note in encodeRequest().
    if (info[0].hubType === HubType.CityHub && !connectResult.canWriteWithoutResponse) {
        yield put(
            notification.add(
                'error',
                'City Hub bootloader is not compatible with this web browser.',
            ),
        );
        const disconnectAction = (yield put(
            disconnectRequest(),
        )) as BootloaderDisconnectRequestAction;
        yield waitForDidSend(disconnectAction.id);
        return;
    }

    const eraseAction = (yield put(eraseRequest())) as BootloaderEraseRequestAction;
    const [, erase] = (yield all([
        waitForDidSend(eraseAction.id),
        waitForResponse(BootloaderResponseActionType.Erase, 5000),
    ])) as [BootloaderDidRequestAction, WaitResponse<BootloaderEraseResponseAction>];
    if (!erase[0] || erase[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to erase: ${erase}`);
    }

    const initAction = (yield put(
        initRequest(firmware.length),
    )) as BootloaderInitRequestAction;
    const [, init] = (yield all([
        waitForDidSend(initAction.id),
        waitForResponse(BootloaderResponseActionType.Init),
    ])) as [BootloaderDidRequestAction, WaitResponse<BootloaderInitResponseAction>];
    if (!init[0] || init[0].result) {
        // TODO: proper error handling
        throw Error(`Failed to init: ${init}`);
    }

    let count = 0;
    const maxDataSize = MaxProgramFlashSize.get(info[0].hubType);
    if (maxDataSize === undefined) {
        // istanbul ignore next: indicates programmer error if reached
        throw Error('Missing hub type in MaxProgramFlashSize');
    }

    for (let offset = 0; offset < firmware.length; offset += maxDataSize) {
        const payload = firmware.slice(offset, offset + maxDataSize);
        const programAction = (yield put(
            programRequest(info[0].startAddress + offset, payload.buffer),
        )) as BootloaderProgramRequestAction;
        yield waitForDidSend(programAction.id);

        yield put(progress(offset, firmware.length));

        if (connectResult.canWriteWithoutResponse) {
            // Request checksum every 10 packets to prevent buffer overrun on
            // the hub because of sending too much data at once. The actual
            // number of packets that can be queued in the Bluetooth chip on
            // the hub is not known and could vary by device.
            if (++count % 10 === 0) {
                const checksumAction = (yield put(
                    checksumRequest(),
                )) as BootloaderChecksumRequestAction;
                const [, checksum] = (yield all([
                    waitForDidSend(checksumAction.id),
                    waitForResponse(BootloaderResponseActionType.Checksum, 5000),
                ])) as [
                    BootloaderDidRequestAction,
                    WaitResponse<BootloaderChecksumResponseAction>,
                ];
                if (!checksum[0]) {
                    // TODO: proper error handling
                    throw Error(`Failed to get checksum: ${checksum}`);
                }
            }
        }
    }

    const flash = (yield waitForResponse(
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
    const rebootAction = (yield put(rebootRequest())) as BootloaderRebootRequestAction;
    yield waitForDidSend(rebootAction.id);
}

export default function* (): Generator {
    yield takeEvery(FlashFirmwareActionType.FlashFirmware, flashFirmware);
}
