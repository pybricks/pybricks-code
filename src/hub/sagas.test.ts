// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Ace } from 'ace-builds';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    BlePybricksServiceCommandActionType,
    BlePybricksServiceCommandSendStopUserProgram,
    didSendCommand,
} from '../ble-pybricks-service/actions';
import { BleUartActionType, BleUartWriteAction, didWrite } from '../ble-uart/actions';
import { MpyActionType, didCompile } from '../mpy/actions';
import { createCountFunc } from '../utils/iter';
import { HubActionType, checksum, downloadAndRun, repl, stop } from './actions';
import hub from './sagas';

jest.mock('ace-builds');

describe('downloadAndRun', () => {
    test('no errors', async () => {
        const mockEditor = mock<Ace.EditSession>();
        const saga = new AsyncSaga(
            hub,
            { editor: { current: mockEditor } },
            { nextMessageId: createCountFunc() },
        );

        saga.put(downloadAndRun());

        // first, it tries to compile the program in the current editor
        const compileAction = await saga.take();
        expect(compileAction.type).toBe(MpyActionType.Compile);
        saga.put(didCompile(new Uint8Array(30)));

        // then it notifies that loading has begun
        const loadingStatusAction = await saga.take();
        expect(loadingStatusAction.type).toBe(HubActionType.DidStartDownload);

        // first message is the length
        const writeAction = await saga.take();
        expect(writeAction.type).toBe(BleUartActionType.Write);
        expect((writeAction as BleUartWriteAction).value.length).toBe(4);
        saga.put(didWrite((writeAction as BleUartWriteAction).id));
        saga.put(checksum(30));

        // then the first chunk of 20 bytes
        const writeAction2 = await saga.take();
        expect(writeAction2.type).toBe(BleUartActionType.Write);
        expect((writeAction2 as BleUartWriteAction).value.length).toBe(20);
        saga.put(didWrite((writeAction2 as BleUartWriteAction).id));
        saga.put(checksum(0));

        // then last chunk
        const writeAction3 = await saga.take();
        expect(writeAction3.type).toBe(BleUartActionType.Write);
        expect((writeAction3 as BleUartWriteAction).value.length).toBe(10);
        saga.put(didWrite((writeAction3 as BleUartWriteAction).id));
        saga.put(checksum(0));

        // Then a status message saying that we are done
        const loadedStatusAction = await saga.take();
        expect(loadedStatusAction.type).toBe(HubActionType.DidFinishDownload);

        await saga.end();
    });

    // TODO: need to test error paths
});

test('repl', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(repl());

    const action = await saga.take();
    expect(action.type).toBe(BleUartActionType.Write);

    await saga.end();
});

test('stop', async () => {
    const saga = new AsyncSaga(hub, {}, { nextMessageId: createCountFunc() });

    saga.put(stop());

    const pybricksServiceAction = await saga.take();
    expect(pybricksServiceAction.type).toBe(
        BlePybricksServiceCommandActionType.SendStopUserProgram,
    );

    saga.put(
        didSendCommand(
            (pybricksServiceAction as BlePybricksServiceCommandSendStopUserProgram).id,
        ),
    );

    await saga.end();
});
