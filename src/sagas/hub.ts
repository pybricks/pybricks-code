// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    SagaGenerator,
    actionChannel,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { Action } from '../actions';
import { BleDeviceActionType } from '../actions/ble';
import {
    BleUartActionType,
    BleUartDidFailToWriteAction,
    BleUartDidWriteAction,
    write,
} from '../actions/ble-uart';
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
import { SafeTxCharLength } from '../protocols/nrf-uart';
import { RootState } from '../reducers';
import { defined } from '../utils';
import { xor8 } from '../utils/math';

const downloadChunkSize = 100;

function* waitForWrite(
    id: number,
): SagaGenerator<{
    didWrite: BleUartDidWriteAction | undefined;
    didFailToWrite: BleUartDidFailToWriteAction | undefined;
}> {
    return yield* race({
        didWrite: take<BleUartDidWriteAction>(
            (a: Action) => a.type === BleUartActionType.DidWrite && a.id === id,
        ),
        didFailToWrite: take<BleUartDidFailToWriteAction>(
            (a: Action) => a.type === BleUartActionType.DidFailToWrite && a.id === id,
        ),
    });
}

function* downloadAndRun(_action: HubDownloadAndRunAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('downloadAndRun: No current editor');
        return;
    }

    const script = editor.getValue();
    yield* put(compile(script, ['-mno-unicode']));
    const { mpy, mpyFail } = yield* race({
        mpy: take<MpyDidCompileAction>(MpyActionType.DidCompile),
        mpyFail: take<MpyDidFailToCompileAction>(MpyActionType.DidFailToCompile),
    });

    if (mpyFail) {
        return;
    }

    defined(mpy);

    // let everyone know the runtime is busy loading the program
    yield* put(updateStatus(HubRuntimeStatusType.Loading));

    const checksumChannel = yield* actionChannel<HubChecksumMessageAction>(
        HubMessageActionType.Checksum,
    );

    const nextMessageId = yield* getContext<() => number>('nextMessageId');

    // first send payload size as big-endian 32-bit integer
    const sizeBuf = new Uint8Array(4);
    const sizeView = new DataView(sizeBuf.buffer);
    sizeView.setUint32(0, mpy.data.byteLength, true);
    const writeAction = yield* put(write(nextMessageId(), sizeBuf));
    const { didFailToWrite } = yield* waitForWrite(writeAction.id);

    if (didFailToWrite) {
        yield* put(updateStatus(HubRuntimeStatusType.Error));
        return;
    }

    const checksumAction = yield* take(checksumChannel);
    if (checksumAction.checksum !== (0xff ^ xor8(sizeBuf))) {
        console.error(
            `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(sizeBuf)}`,
        );
        yield* put(updateStatus(HubRuntimeStatusType.Error));
        return;
    }

    // Then send payload in 100 byte chunks waiting for checksum after
    // each chunk
    for (let i = 0; i < mpy.data.byteLength; i += downloadChunkSize) {
        // need to subscribe to checksum before writing to prevent race condition
        const chunk = mpy.data.slice(i, i + downloadChunkSize);

        // we can actually only write 20 bytes at a time
        for (let j = 0; j < chunk.length; j += SafeTxCharLength) {
            const writeAction = yield* put(
                write(nextMessageId(), chunk.slice(j, j + SafeTxCharLength)),
            );
            const { didFailToWrite } = yield* waitForWrite(writeAction.id);

            if (didFailToWrite) {
                yield* put(updateStatus(HubRuntimeStatusType.Error));
                return;
            }
            // TODO: dispatch progress
        }
        const checksumAction = yield* take(checksumChannel);
        if (checksumAction.checksum !== (0xff ^ xor8(chunk))) {
            console.error(
                `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(chunk)}`,
            );
            yield* put(updateStatus(HubRuntimeStatusType.Error));
            return;
        }
    }

    // let everyone know the runtime is done loading the program
    yield* put(updateStatus(HubRuntimeStatusType.Loaded));
}

// SPACE, SPACE, SPACE, SPACE
const startReplCommand = new Uint8Array([0x20, 0x20, 0x20, 0x20]);

function* startRepl(_action: HubReplAction): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    yield* put(write(nextMessageId(), startReplCommand));
}

// CTRL+C, CTRL+C, CTRL+D
const stopCommand = new Uint8Array([0x03, 0x03, 0x04]);

function* stop(_action: HubStopAction): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    yield* put(write(nextMessageId(), stopCommand));
}

export default function* (): Generator {
    yield* takeEvery(HubActionType.DownloadAndRun, downloadAndRun);
    yield* takeEvery(HubActionType.Repl, startRepl);
    yield* takeEvery(HubActionType.Stop, stop);
    // calling stop right after connecting should get the hub into a known state
    yield* takeEvery(BleDeviceActionType.DidConnect, stop);
}
