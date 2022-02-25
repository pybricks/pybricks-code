// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import { monaco } from 'react-monaco-editor';
import { AsyncSaga } from '../../test';
import { didWrite, write } from '../ble-nordic-uart-service/actions';
import {
    didSendCommand,
    sendStopUserProgramCommand,
} from '../ble-pybricks-service/actions';
import { compile, didCompile } from '../mpy/actions';
import { createCountFunc } from '../utils/iter';
import {
    checksum,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
    downloadAndRun,
    repl,
    stop,
} from './actions';
import hub from './sagas';

jest.mock('react-monaco-editor');

describe('downloadAndRun', () => {
    test('no errors', async () => {
        const mockEditor = mock<monaco.editor.ICodeEditor>();
        const saga = new AsyncSaga(
            hub,
            { editor: { current: mockEditor } },
            { nextMessageId: createCountFunc() },
        );

        saga.put(downloadAndRun());

        // first, it tries to compile the program in the current editor
        const compileAction = await saga.take();
        expect(compileAction.type).toBe(compile.toString());
        saga.put(didCompile(new Uint8Array(30)));

        // then it notifies that loading has begun
        const loadingStatusAction = await saga.take();
        expect(loadingStatusAction.type).toBe(didStartDownload.toString());

        // first message is the length
        const writeAction = await saga.take();
        expect(writeAction.type).toBe(write.toString());
        expect((writeAction as ReturnType<typeof write>).value.length).toBe(4);
        saga.put(didWrite((writeAction as ReturnType<typeof write>).id));
        saga.put(checksum(30));

        // then progress is updated
        const progressAction = await saga.take();
        expect(progressAction.type).toBe(didProgressDownload.toString());
        expect(
            (progressAction as ReturnType<typeof didProgressDownload>).progress,
        ).toBe(0);

        // then the first chunk of 20 bytes
        const writeAction2 = await saga.take();
        expect(writeAction2.type).toBe(write.toString());
        expect((writeAction2 as ReturnType<typeof write>).value.length).toBe(20);
        saga.put(didWrite((writeAction2 as ReturnType<typeof write>).id));
        saga.put(checksum(0));

        // then progress is updated
        const progress2Action = await saga.take();
        expect(progress2Action.type).toBe(didProgressDownload.toString());
        expect(
            (progress2Action as ReturnType<typeof didProgressDownload>).progress,
        ).toBe(20 / 30);

        // then last chunk
        const writeAction3 = await saga.take();
        expect(writeAction3.type).toBe(write.toString());
        expect((writeAction3 as ReturnType<typeof write>).value.length).toBe(10);
        saga.put(didWrite((writeAction3 as ReturnType<typeof write>).id));
        saga.put(checksum(0));

        // Then a status message saying that we are done
        const loadedStatusAction = await saga.take();
        expect(loadedStatusAction.type).toBe(didFinishDownload.toString());

        await saga.end();
    });

    // TODO: need to test error paths
});

test('repl', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(repl());

    const action = await saga.take();
    expect(action.type).toBe(write.toString());

    await saga.end();
});

test('stop', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(stop());

    const pybricksServiceAction = await saga.take();
    expect(pybricksServiceAction.type).toBe(sendStopUserProgramCommand.toString());

    saga.put(
        didSendCommand(
            (pybricksServiceAction as ReturnType<typeof sendStopUserProgramCommand>).id,
        ),
    );

    await saga.end();
});
