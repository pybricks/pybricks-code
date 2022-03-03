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
            {},
            {
                editor: mockEditor,
                nextMessageId: createCountFunc(),
            },
        );

        saga.put(downloadAndRun());

        // first, it tries to compile the program in the current editor
        const compileAction = await saga.take();
        expect(compile.matches(compileAction)).toBeTruthy();
        saga.put(didCompile(new Uint8Array(30)));

        // then it notifies that loading has begun
        const loadingStatusAction = await saga.take();
        expect(loadingStatusAction).toEqual(didStartDownload());

        // first message is the length
        const writeAction = await saga.take();
        expect(writeAction).toBeTruthy();
        expect((writeAction as ReturnType<typeof write>).value.length).toBe(4);
        saga.put(didWrite(0));
        saga.put(checksum(30));

        // then progress is updated
        const progressAction = await saga.take();
        expect(progressAction).toEqual(didProgressDownload(0));

        // then the first chunk of 20 bytes
        const writeAction2 = await saga.take();
        expect(write.matches(writeAction2)).toBeTruthy();
        expect((writeAction2 as ReturnType<typeof write>).value.length).toBe(20);
        saga.put(didWrite(1));
        saga.put(checksum(0));

        // then progress is updated
        const progress2Action = await saga.take();
        expect(progress2Action).toEqual(didProgressDownload(20 / 30));

        // then last chunk
        const writeAction3 = await saga.take();
        expect(write.matches(writeAction3)).toBeTruthy();
        expect((writeAction3 as ReturnType<typeof write>).value.length).toBe(10);
        saga.put(didWrite(2));
        saga.put(checksum(0));

        // Then a status message saying that we are done
        const loadedStatusAction = await saga.take();
        expect(loadedStatusAction).toEqual(didFinishDownload());

        await saga.end();
    });

    // TODO: need to test error paths
});

test('repl', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(repl());

    const action = await saga.take();
    expect(action).toEqual(write(0, new Uint8Array([32, 32, 32, 32])));

    await saga.end();
});

test('stop', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(stop());

    const pybricksServiceAction = await saga.take();
    expect(pybricksServiceAction).toEqual(sendStopUserProgramCommand(0));

    saga.put(didSendCommand(0));

    await saga.end();
});
