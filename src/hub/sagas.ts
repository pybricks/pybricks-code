// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import {
    SagaGenerator,
    actionChannel,
    call,
    delay,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import { didFailToWrite, didWrite, write } from '../ble-nordic-uart-service/actions';
import { nordicUartSafeTxCharLength } from '../ble-nordic-uart-service/protocol';
import {
    didFailToSendCommand,
    didSendCommand,
    sendStartReplCommand,
    sendStartUserProgramCommand,
    sendStopUserProgramCommand,
    sendWriteUserProgramMetaCommand,
    sendWriteUserRamCommand,
} from '../ble-pybricks-service/actions';
import { FileFormat } from '../ble-pybricks-service/protocol';
import { bleDidConnectPybricks } from '../ble/actions';
import { editorGetValue } from '../editor/sagas';
import {
    compile,
    didCompile,
    didFailToCompile,
    mpyCompileMulti6,
    mpyDidCompileMulti6,
    mpyDidFailToCompileMulti6,
} from '../mpy/actions';
import { RootState } from '../reducers';
import { defined, ensureError } from '../utils';
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
        didWrite: take(didWrite.when((a) => a.id === id)),
        didFailToWrite: take(didFailToWrite.when((a) => a.id === id)),
    });
}

function* handleLegacyDownloadAndRun(
    action: ReturnType<typeof downloadAndRun>,
): Generator {
    const script = yield* editorGetValue();

    yield* put(
        compile(
            script,
            action.fileFormat === FileFormat.Mpy5 ? 5 : 6,
            // no-unicode option was removed in MPY ABI v6
            action.fileFormat === FileFormat.Mpy5 ? ['-mno-unicode'] : [],
        ),
    );

    const { mpy, mpyFail } = yield* race({
        mpy: take(didCompile),
        mpyFail: take(didFailToCompile),
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

    const checksumChannel = yield* actionChannel(checksum);

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
        for (let j = 0; j < chunk.length; j += nordicUartSafeTxCharLength) {
            yield* put(didProgressDownload((i + j) / mpy.data.byteLength));
            const writeAction = yield* put(
                write(nextMessageId(), chunk.slice(j, j + nordicUartSafeTxCharLength)),
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

function* handleDownloadAndRun(action: ReturnType<typeof downloadAndRun>): Generator {
    if (action.useLegacyDownload) {
        yield* handleLegacyDownloadAndRun(action);
        return;
    }

    try {
        // TODO: should everything before didStartDownload be in try block?

        if (action.fileFormat !== FileFormat.MultiMpy6) {
            // TODO: show error message?
            throw new Error('unsupported file format');
        }

        // REVISIT: these are not valid if hub is not connected
        const chunkSize = (yield* select((s: RootState) => s.hub.maxBleWriteSize)) - 5;
        const maxUserProgramSize = yield* select(
            (s: RootState) => s.hub.maxUserProgramSize,
        );

        yield* put(mpyCompileMulti6());

        const { didCompile, didFailToCompile } = yield* race({
            didCompile: take(mpyDidCompileMulti6),
            didFailToCompile: take(mpyDidFailToCompileMulti6),
        });

        if (didFailToCompile) {
            return;
        }

        defined(didCompile);

        if (process.env.NODE_ENV !== 'test') {
            console.log(`Downloading ${didCompile.file.size} bytes`);
        }

        if (didCompile.file.size >= maxUserProgramSize) {
            // TODO: proper error notification
            throw new Error('file too big');
        }

        // let everyone know the runtime is busy loading the program
        yield* put(didStartDownload());

        const nextMessageId = yield* getContext<() => number>('nextMessageId');

        const writeUserMetaMessageId = nextMessageId();

        // write size of 0 to invalidate any existing user program
        yield* put(sendWriteUserProgramMetaCommand(writeUserMetaMessageId, 0));

        const { didFailToSend } = yield* race({
            didSend: take(didSendCommand.when((a) => a.id === writeUserMetaMessageId)),
            didFailToSend: take(
                didFailToSendCommand.when((a) => a.id === writeUserMetaMessageId),
            ),
        });

        if (didFailToSend) {
            throw didFailToSend.error;
        }

        for (let i = 0; i < didCompile.file.size; i += chunkSize) {
            yield* put(didProgressDownload(i / didCompile.file.size));

            const writeUserRamMessageId = nextMessageId();

            const data = yield* call(() =>
                didCompile.file.slice(i, i + chunkSize).arrayBuffer(),
            );

            yield* put(sendWriteUserRamCommand(writeUserRamMessageId, i, data));

            const { didFailToSend } = yield* race({
                didSend: take(
                    didSendCommand.when((a) => a.id === writeUserRamMessageId),
                ),
                didFailToSend: take(
                    didFailToSendCommand.when((a) => a.id === writeUserRamMessageId),
                ),
            });

            if (didFailToSend) {
                throw didFailToSend.error;
            }
        }

        const writeUserMetaMessageId2 = nextMessageId();

        yield* put(
            sendWriteUserProgramMetaCommand(
                writeUserMetaMessageId2,
                didCompile.file.size,
            ),
        );

        const { didFailToSend2 } = yield* race({
            didSend2: take(
                didSendCommand.when((a) => a.id === writeUserMetaMessageId2),
            ),
            didFailToSend2: take(
                didFailToSendCommand.when((a) => a.id === writeUserMetaMessageId2),
            ),
        });

        if (didFailToSend2) {
            throw didFailToSend2.error;
        }

        yield* put(didFinishDownload());

        const startUserProgramId = nextMessageId();
        yield* put(sendStartUserProgramCommand(startUserProgramId));

        const { didFailToStart } = yield* race({
            didStart: take(didSendCommand.when((a) => a.id === startUserProgramId)),
            didFailToStart: take(
                didFailToSendCommand.when((a) => a.id === startUserProgramId),
            ),
        });

        if (didFailToStart) {
            throw didFailToStart.error;
        }
    } catch (err) {
        // istanbul ignore if
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }

        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', { error: ensureError(err) }),
        );

        yield* put(didFailToFinishDownload());
    }
}

// SPACE, SPACE, SPACE, SPACE
const legacyStartReplCommand = new Uint8Array([0x20, 0x20, 0x20, 0x20]);

function* handleRepl(action: ReturnType<typeof repl>): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');

    if (action.useLegacyDownload) {
        yield* put(write(nextMessageId(), legacyStartReplCommand));
        return;
    }

    yield* put(sendStartReplCommand(nextMessageId()));
}

function* handleStop(): Generator {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');
    const id = nextMessageId();
    yield* put(sendStopUserProgramCommand(id));
    // REVISIT: may want to disable button while attempting to send command
    // this would mean didSendStop() and didFailToSendStop() actions here
    const { failedToSend } = yield* race({
        sent: take(didSendCommand.when((a) => a.id === id)),
        failedToSend: take(didFailToSendCommand.when((a) => a.id === id)),
    });
    if (failedToSend) {
        // TODO: probably want to check error. If hub disconnected, ignore error
        // otherwise indicate error to user
        console.error(failedToSend.error);
    }
}

export default function* (): Generator {
    yield* takeEvery(downloadAndRun, handleDownloadAndRun);
    yield* takeEvery(repl, handleRepl);
    yield* takeEvery(stop, handleStop);
    // calling stop right after connecting should get the hub into a known state
    yield* takeEvery(bleDidConnectPybricks, handleStop);
}
