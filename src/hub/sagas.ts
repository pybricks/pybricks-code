// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    SagaGenerator,
    actionChannel,
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
    BleUartActionType,
    BleUartDidFailToWriteAction,
    BleUartDidWriteAction,
    write,
} from '../ble-nordic-uart-service/actions';
import { SafeTxCharLength } from '../ble-nordic-uart-service/protocol';
import {
    BlePybricksServiceCommandActionType,
    BlePybricksServiceCommandDidFailToSendAction,
    BlePybricksServiceCommandDidSendAction,
    sendStopUserProgramCommand,
} from '../ble-pybricks-service/actions';
import { BleDeviceActionType } from '../ble/actions';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../mpy/actions';
import { RootState } from '../reducers';
import { defined } from '../utils';
import { xor8 } from '../utils/math';
import {
    HubActionType,
    HubChecksumMessageAction,
    HubDownloadAndRunAction,
    HubMessageActionType,
    HubReplAction,
    HubStopAction,
    didFailToFinishDownload as didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
} from './actions';

const downloadChunkSize = 100;

function* waitForWrite(id: number): SagaGenerator<{
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
    yield* put(didStartDownload());

    // TODO: show compiled size in UI?
    if (process.env.NODE_ENV !== 'test') {
        console.log(`Downloading ${mpy.data.byteLength} bytes`);
    }

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
        yield* put(didFailToFinishDownload());
        return;
    }

    const { checksumAction, checksumTimeout } = yield* race({
        checksumAction: take(checksumChannel),
        checksumTimeout: delay(1000),
    });

    if (checksumTimeout) {
        console.error(`timeout waiting for checksum`);
        yield* put(didFailToFinishDownload());
        return;
    }

    defined(checksumAction);

    if (checksumAction.checksum !== (0xff ^ xor8(sizeBuf))) {
        console.error(
            `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(sizeBuf)}`,
        );
        yield* put(didFailToFinishDownload());
        return;
    }

    // Then send payload in 100 byte chunks waiting for checksum after
    // each chunk
    for (let i = 0; i < mpy.data.byteLength; i += downloadChunkSize) {
        // need to subscribe to checksum before writing to prevent race condition
        const chunk = mpy.data.slice(i, i + downloadChunkSize);

        // we can actually only write 20 bytes at a time
        for (let j = 0; j < chunk.length; j += SafeTxCharLength) {
            yield* put(didProgressDownload((i + j) / mpy.data.byteLength));
            const writeAction = yield* put(
                write(nextMessageId(), chunk.slice(j, j + SafeTxCharLength)),
            );
            const { didFailToWrite } = yield* waitForWrite(writeAction.id);

            if (didFailToWrite) {
                yield* put(didFailToFinishDownload());
                return;
            }
        }

        const { checksumAction, checksumTimeout } = yield* race({
            checksumAction: take(checksumChannel),
            checksumTimeout: delay(1000),
        });

        if (checksumTimeout) {
            console.error(`timeout waiting for checksum`);
            yield* put(didFailToFinishDownload());
            return;
        }

        defined(checksumAction);

        if (checksumAction.checksum !== (0xff ^ xor8(chunk))) {
            console.error(
                `bad checksum ${checksumAction.checksum} vs ${0xff ^ xor8(chunk)}`,
            );
            yield* put(didFailToFinishDownload());
            return;
        }
    }

    // let everyone know the runtime is done loading the program
    yield* put(didFinishDownload());
}

// SPACE, SPACE, SPACE, SPACE
const startReplCommand = new Uint8Array([0x20, 0x20, 0x20, 0x20]);

function* startRepl(_action: HubReplAction): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    yield* put(write(nextMessageId(), startReplCommand));
}

function* stop(_action: HubStopAction): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    const id = nextMessageId();
    yield* put(sendStopUserProgramCommand(id));
    // REVISIT: may want to disable button while attempting to send command
    // this would mean didSendStop() and didFailToSendStop() actions here
    const { failedToSend } = yield* race({
        sent: take<BlePybricksServiceCommandDidSendAction>(
            (a: Action) =>
                a.type === BlePybricksServiceCommandActionType.DidSend && a.id === id,
        ),
        failedToSend: take<BlePybricksServiceCommandDidFailToSendAction>(
            (a: Action) =>
                a.type === BlePybricksServiceCommandActionType.DidFailToSend &&
                a.id === id,
        ),
    });
    if (failedToSend) {
        // TODO: probably want to check error. If hub disconnected, ignore error
        // otherwise indicate error to user
        console.error(failedToSend.err);
    }
}

export default function* (): Generator {
    yield* takeEvery(HubActionType.DownloadAndRun, downloadAndRun);
    yield* takeEvery(HubActionType.Repl, startRepl);
    yield* takeEvery(HubActionType.Stop, stop);
    // calling stop right after connecting should get the hub into a known state
    yield* takeEvery(BleDeviceActionType.DidConnect, stop);
}
