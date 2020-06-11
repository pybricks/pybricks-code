// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { Channel } from 'redux-saga';
import {
    RaceEffect,
    TakeEffect,
    actionChannel,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'redux-saga/effects';
import { Action } from '../actions';
import {
    BLEDataActionType,
    BLEDataDidFailToWriteAction,
    BLEDataDidWriteAction,
    BLEDataWriteAction,
    write,
} from '../actions/ble';
import {
    HubActionType,
    HubChecksumMessageAction,
    HubDownloadAndRunAction,
    HubMessageActionType,
    HubReplAction,
    HubRuntimeStatusType,
    HubStopAction,
    updateStatus,
} from '../actions/hub';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../actions/mpy';
import { RootState } from '../reducers';
import { xor8 } from '../utils/math';

const downloadChunkSize = 100;

function waitForWrite(id: number): RaceEffect<TakeEffect> {
    return race([
        take((a: Action) => a.type === BLEDataActionType.DidWrite && a.id === id),
        take((a: Action) => a.type === BLEDataActionType.DidFailToWrite && a.id === id),
    ]);
}

function* downloadAndRun(_action: HubDownloadAndRunAction): Generator {
    const editor = (yield select(
        (s: RootState) => s.editor.current,
    )) as Ace.EditSession | null;

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('downloadAndRun: No current editor');
        return;
    }

    const script = editor.getValue();
    yield put(compile(script, ['-mno-unicode']));
    const [mpy, mpyFail] = (yield race([
        take(MpyActionType.DidCompile),
        take(MpyActionType.DidFailToCompile),
    ])) as [MpyDidCompileAction, MpyDidFailToCompileAction];

    if (mpyFail) {
        return;
    }

    // let everyone know the runtime is busy loading the program
    yield put(updateStatus(HubRuntimeStatusType.Loading));

    const checksumChannel = (yield actionChannel(
        HubMessageActionType.Checksum,
    )) as Channel<HubChecksumMessageAction>;

    // first send payload size as big-endian 32-bit integer
    const sizeBuf = new Uint8Array(4);
    const sizeView = new DataView(sizeBuf.buffer);
    sizeView.setUint32(0, mpy.data.byteLength, true);
    const writeAction = (yield put(write(sizeBuf))) as BLEDataWriteAction;
    const [, didFailToWrite] = (yield waitForWrite(writeAction.id)) as [
        BLEDataDidWriteAction,
        BLEDataDidFailToWriteAction,
    ];

    if (didFailToWrite) {
        yield put(updateStatus(HubRuntimeStatusType.Error));
        return;
    }

    const checksumAction = (yield take(checksumChannel)) as HubChecksumMessageAction;
    if (checksumAction.checksum !== (0xff ^ xor8(sizeBuf))) {
        console.error(
            `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(sizeBuf)}`,
        );
        yield put(updateStatus(HubRuntimeStatusType.Error));
        return;
    }

    // Then send payload in 100 byte chunks waiting for checksum after
    // each chunk
    for (let i = 0; i < mpy.data.byteLength; i += downloadChunkSize) {
        // need to subscribe to checksum before writing to prevent race condition
        const chunk = mpy.data.slice(i, i + downloadChunkSize);

        // we can actually only write 20 bytes at a time
        for (let j = 0; j < chunk.length; j += 20) {
            const writeAction = (yield put(
                write(chunk.slice(j, j + 20)),
            )) as BLEDataWriteAction;
            const [, didFailToWrite] = (yield waitForWrite(writeAction.id)) as [
                BLEDataDidWriteAction,
                BLEDataDidFailToWriteAction,
            ];

            if (didFailToWrite) {
                yield put(updateStatus(HubRuntimeStatusType.Error));
                return;
            }
            // TODO: dispatch progress
        }
        const checksumAction = (yield take(
            checksumChannel,
        )) as HubChecksumMessageAction;
        if (checksumAction.checksum !== (0xff ^ xor8(chunk))) {
            console.error(
                `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(chunk)}`,
            );
            yield put(updateStatus(HubRuntimeStatusType.Error));
            return;
        }
    }

    // let everyone know the runtime is done loading the program
    yield put(updateStatus(HubRuntimeStatusType.Loaded));
}

// SPACE, SPACE, SPACE, SPACE
const startReplCommand = new Uint8Array([0x20, 0x20, 0x20, 0x20]);

function* startRepl(_action: HubReplAction): Generator {
    yield put(write(startReplCommand));
}

// CTRL+C, CTRL+C, CTRL+D
const stopCommand = new Uint8Array([0x03, 0x03, 0x04]);

function* stop(_action: HubStopAction): Generator {
    yield put(write(stopCommand));
}

export default function* (): Generator {
    yield takeEvery(HubActionType.DownloadAndRun, downloadAndRun);
    yield takeEvery(HubActionType.Repl, startRepl);
    yield takeEvery(HubActionType.Stop, stop);
}
