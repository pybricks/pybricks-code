// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { alertsShowAlert } from '../alerts/actions';
import { didWrite, write } from '../ble-nordic-uart-service/actions';
import {
    didFailToSendCommand,
    didSendCommand,
    sendStartReplCommand,
    sendStopUserProgramCommand,
} from '../ble-pybricks-service/actions';
import { FileFormat } from '../ble-pybricks-service/protocol';
import { editorGetValueRequest, editorGetValueResponse } from '../editor/actions';
import { compile, didCompile } from '../mpy/actions';
import { createCountFunc } from '../utils/iter';
import {
    checksum,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
    downloadAndRun,
    hubDidFailToStartRepl,
    hubDidFailToStopUserProgram,
    hubDidStartRepl,
    hubDidStopUserProgram,
    hubStartRepl,
    hubStopUserProgram,
} from './actions';
import hub from './sagas';

describe('downloadAndRun', () => {
    test('no errors', async () => {
        const saga = new AsyncSaga(hub, {
            nextMessageId: createCountFunc(),
        });

        saga.updateState({ editor: { isReady: true } });

        saga.put(downloadAndRun(FileFormat.Mpy5, true));

        // first, it gets the value from the current editor
        const editorValueAction = await saga.take();
        expect(editorValueAction).toEqual(editorGetValueRequest(0));

        saga.put(editorGetValueResponse(0, ''));

        // then it tries to compile the program in the current editor
        const compileAction = await saga.take();
        expect(compileAction).toEqual(compile('', 5, ['-mno-unicode']));
        saga.put(didCompile(new Uint8Array(30)));

        // then it notifies that loading has begun
        const loadingStatusAction = await saga.take();
        expect(loadingStatusAction).toEqual(didStartDownload());

        // first message is the length
        const writeAction = await saga.take();
        expect(writeAction).toEqual(write(1, new Uint8Array([30, 0, 0, 0])));
        saga.put(didWrite(1));
        saga.put(checksum(30));

        // then progress is updated
        const progressAction = await saga.take();
        expect(progressAction).toEqual(didProgressDownload(0));

        // then the first chunk of 20 bytes
        const writeAction2 = await saga.take();
        expect(writeAction2).toEqual(write(2, new Uint8Array(20)));
        saga.put(didWrite(2));
        saga.put(checksum(0));

        // then progress is updated
        const progress2Action = await saga.take();
        expect(progress2Action).toEqual(didProgressDownload(20 / 30));

        // then last chunk
        const writeAction3 = await saga.take();
        expect(writeAction3).toEqual(write(3, new Uint8Array(10)));
        saga.put(didWrite(3));
        saga.put(checksum(0));

        // Then a status message saying that we are done
        const loadedStatusAction = await saga.take();
        expect(loadedStatusAction).toEqual(didFinishDownload());

        await saga.end();
    });

    // TODO: need to test error paths
});

describe('hubStartRepl', () => {
    test('legacy UART download', async () => {
        const saga = new AsyncSaga(hub, { nextMessageId: createCountFunc() });

        saga.put(hubStartRepl(true));

        await expect(saga.take()).resolves.toEqual(
            write(0, new Uint8Array([32, 32, 32, 32])),
        );

        await expect(saga.take()).resolves.toEqual(hubDidStartRepl());

        await saga.end();
    });

    test('success', async () => {
        const saga = new AsyncSaga(hub, { nextMessageId: createCountFunc() });

        saga.put(hubStartRepl(false));

        await expect(saga.take()).resolves.toEqual(sendStartReplCommand(0));

        saga.put(didSendCommand(0));

        await expect(saga.take()).resolves.toEqual(hubDidStartRepl());

        await saga.end();
    });

    test('failure due to disconnect', async () => {
        const saga = new AsyncSaga(hub, { nextMessageId: createCountFunc() });

        saga.put(hubStartRepl(false));

        await expect(saga.take()).resolves.toEqual(sendStartReplCommand(0));

        saga.put(didFailToSendCommand(0, new DOMException('test', 'NetworkError')));

        await expect(saga.take()).resolves.toEqual(
            alertsShowAlert('ble', 'disconnected'),
        );

        await expect(saga.take()).resolves.toEqual(hubDidFailToStartRepl());

        await saga.end();
    });
});

describe('hubStopUserProgram', () => {
    test('success', async () => {
        const saga = new AsyncSaga(hub, { nextMessageId: createCountFunc() });

        saga.put(hubStopUserProgram());

        await expect(saga.take()).resolves.toEqual(sendStopUserProgramCommand(0));

        saga.put(didSendCommand(0));

        await expect(saga.take()).resolves.toEqual(hubDidStopUserProgram());

        await saga.end();
    });

    test('failure due to disconnect', async () => {
        const saga = new AsyncSaga(hub, { nextMessageId: createCountFunc() });

        saga.put(hubStopUserProgram());

        await expect(saga.take()).resolves.toEqual(sendStopUserProgramCommand(0));

        saga.put(didFailToSendCommand(0, new DOMException('test', 'NetworkError')));

        await expect(saga.take()).resolves.toEqual(
            alertsShowAlert('ble', 'disconnected'),
        );

        await expect(saga.take()).resolves.toEqual(hubDidFailToStopUserProgram());

        await saga.end();
    });
});
