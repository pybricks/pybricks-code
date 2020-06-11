// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import { BLEDataActionType, BLEDataWriteAction, didWrite } from '../actions/ble';
import {
    HubMessageActionType,
    HubRuntimeStatusMessageAction,
    HubRuntimeStatusType,
    checksum,
    downloadAndRun,
    repl,
    stop,
} from '../actions/hub';
import { MpyActionType, didCompile } from '../actions/mpy';
import hub from './hub';

jest.mock('ace-builds');

describe('downloadAndRun', () => {
    test('no errors', async () => {
        const saga = new AsyncSaga(hub);

        const mockEditor = mock<Ace.EditSession>();
        saga.setState({ editor: { current: mockEditor } });

        saga.put(downloadAndRun());

        // first, it tries to compile the program in the current editor
        const compileAction = await saga.take();
        expect(compileAction.type).toBe(MpyActionType.Compile);
        saga.put(didCompile(new Uint8Array(30)));

        // then it notifies that loading has begun
        const loadingStatusAction = await saga.take();
        expect(loadingStatusAction.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((loadingStatusAction as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Loading,
        );

        // first message is the length
        const writeAction = await saga.take();
        expect(writeAction.type).toBe(BLEDataActionType.Write);
        expect((writeAction as BLEDataWriteAction).value.length).toBe(4);
        saga.put(didWrite((writeAction as BLEDataWriteAction).id));
        saga.put(checksum(30));

        // then the first chunk of 20 bytes
        const writeAction2 = await saga.take();
        expect(writeAction2.type).toBe(BLEDataActionType.Write);
        expect((writeAction2 as BLEDataWriteAction).value.length).toBe(20);
        saga.put(didWrite((writeAction2 as BLEDataWriteAction).id));
        saga.put(checksum(0));

        // then last chunk
        const writeAction3 = await saga.take();
        expect(writeAction3.type).toBe(BLEDataActionType.Write);
        expect((writeAction3 as BLEDataWriteAction).value.length).toBe(10);
        saga.put(didWrite((writeAction3 as BLEDataWriteAction).id));
        saga.put(checksum(0));

        // Then a status message saying that we are done
        const loadedStatusAction = await saga.take();
        expect(loadedStatusAction.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((loadedStatusAction as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Loaded,
        );

        await saga.end();
    });

    // TODO: need to test error paths
});

test('repl', async () => {
    const saga = new AsyncSaga(hub);

    saga.put(repl());

    const compileAction = await saga.take();
    expect(compileAction.type).toBe(BLEDataActionType.Write);

    await saga.end();
});

test('stop', async () => {
    const saga = new AsyncSaga(hub);

    saga.put(stop());

    const compileAction = await saga.take();
    expect(compileAction.type).toBe(BLEDataActionType.Write);

    await saga.end();
});
