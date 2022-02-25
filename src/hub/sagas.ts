// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { AnyAction } from 'redux';
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
import { didFailToWrite, didWrite, write } from '../ble-nordic-uart-service/actions';
import { SafeTxCharLength } from '../ble-nordic-uart-service/protocol';
import {
    didFailToSendCommand,
    didSendCommand,
    sendStopUserProgramCommand,
} from '../ble-pybricks-service/actions';
import { didConnect } from '../ble/actions';
import { compile, didCompile, didFailToCompile } from '../mpy/actions';
import { RootState } from '../reducers';
import { defined } from '../utils';
import { xor8 } from '../utils/math';
import {
    checksum,
    didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
    downloadAndRun,
    repl,
    stop,
} from './actions';

const downloadChunkSize = 100;

function* waitForWrite(id: number): SagaGenerator<{
    didWrite: ReturnType<typeof didWrite> | undefined;
    didFailToWrite: ReturnType<typeof didFailToWrite> | undefined;
}> {
    return yield* race({
        didWrite: take<ReturnType<typeof didWrite>>(
            (a: AnyAction) => didWrite.matches(a) && a.id === id,
        ),
        didFailToWrite: take<ReturnType<typeof didFailToWrite>>(
            (a: AnyAction) => didFailToWrite.matches(a) && a.id === id,
        ),
    });
}

function* handleDownloadAndRun(): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('downloadAndRun: No current editor');
        return;
    }

    const script = editor.getValue();
    yield* put(compile(script, ['-mno-unicode']));
    const { mpy, mpyFail } = yield* race({
        mpy: take<ReturnType<typeof didCompile>>(didCompile),
        mpyFail: take<ReturnType<typeof didFailToCompile>>(didFailToCompile),
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

    const checksumChannel = yield* actionChannel<ReturnType<typeof checksum>>(checksum);

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

function* handleRepl(): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    yield* put(write(nextMessageId(), startReplCommand));
}

function* handleStop(): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    const id = nextMessageId();
    yield* put(sendStopUserProgramCommand(id));
    // REVISIT: may want to disable button while attempting to send command
    // this would mean didSendStop() and didFailToSendStop() actions here
    const { failedToSend } = yield* race({
        sent: take<ReturnType<typeof didSendCommand>>(
            (a: AnyAction) => didSendCommand.matches(a) && a.id === id,
        ),
        failedToSend: take<ReturnType<typeof didFailToSendCommand>>(
            (a: AnyAction) => didFailToSendCommand.matches(a) && a.id === id,
        ),
    });
    if (failedToSend) {
        // TODO: probably want to check error. If hub disconnected, ignore error
        // otherwise indicate error to user
        console.error(failedToSend.err);
    }
}

export default function* (): Generator {
    yield* takeEvery(downloadAndRun, handleDownloadAndRun);
    yield* takeEvery(repl, handleRepl);
    yield* takeEvery(stop, handleStop);
    // calling stop right after connecting should get the hub into a known state
    yield* takeEvery(didConnect, handleStop);
}
