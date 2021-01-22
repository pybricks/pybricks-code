// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { AsyncSaga, delay } from '../../test';

import { didStart } from '../actions/app';
import {
    BleUartActionType,
    BleUartWriteAction,
    didFailToWrite,
    didWrite,
    notify,
} from '../actions/ble-uart';
import {
    HubChecksumMessageAction,
    HubMessageActionType,
    HubRuntimeStatusMessageAction,
    HubRuntimeStatusType,
} from '../actions/hub';
import {
    TerminalActionType,
    TerminalDataSendDataAction,
    TerminalSetDataSourceAction,
    receiveData,
    sendData,
} from '../actions/terminal';
import { HubRuntimeState } from '../reducers/hub';
import { createCountFunc } from '../utils/iter';
import terminal from './terminal';

describe('Data receiver filters out hub status', () => {
    test('normal message - no status', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // sending ASCII space character
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(notify(new DataView(new Uint8Array([0x20]).buffer)));

        const action = await saga.take();
        expect(action.type).toBe(TerminalActionType.SendData);
        expect((action as TerminalDataSendDataAction).value).toBe(' ');

        await saga.end();
    });

    test('checksum message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.updateState({ hub: { runtime: HubRuntimeState.Loading } });
        saga.put(notify(new DataView(new Uint8Array([0xaa]).buffer)));

        const action = await saga.take();
        expect(action.type).toBe(HubMessageActionType.Checksum);
        expect((action as HubChecksumMessageAction).checksum).toBe(0xaa);

        await saga.end();
    });

    test('idle message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '>>>> IDLE'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x49,
                        0x44,
                        0x4c,
                        0x45,
                    ]).buffer,
                ),
            ),
        );

        const action = await saga.take();
        expect(action.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Idle,
        );

        await saga.end();
    });

    test('idle message with extra text', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '0>>>> IDLE1'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x30,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x49,
                        0x44,
                        0x4c,
                        0x45,
                        0x31,
                    ]).buffer,
                ),
            ),
        );

        // this should get split into '0', idle status, '1'

        const action1 = await saga.take();
        expect(action1.type).toBe(TerminalActionType.SendData);
        expect((action1 as TerminalDataSendDataAction).value).toBe('0');

        const action2 = await saga.take();
        expect(action2.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action2 as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Idle,
        );

        const action3 = await saga.take();
        expect(action3.type).toBe(TerminalActionType.SendData);
        expect((action3 as TerminalDataSendDataAction).value).toBe('1');

        await saga.end();
    });

    test('error message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '>>>> ERROR'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x45,
                        0x52,
                        0x52,
                        0x4f,
                        0x52,
                    ]).buffer,
                ),
            ),
        );

        const action = await saga.take();
        expect(action.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Error,
        );

        await saga.end();
    });

    test('error message with extra text', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '0>>>> ERROR1'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x30,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x45,
                        0x52,
                        0x52,
                        0x4f,
                        0x52,
                        0x31,
                    ]).buffer,
                ),
            ),
        );

        // this should get split into '0', error status, '1'

        const action1 = await saga.take();
        expect(action1.type).toBe(TerminalActionType.SendData);
        expect((action1 as TerminalDataSendDataAction).value).toBe('0');

        const action2 = await saga.take();
        expect(action2.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action2 as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Error,
        );

        const action3 = await saga.take();
        expect(action3.type).toBe(TerminalActionType.SendData);
        expect((action3 as TerminalDataSendDataAction).value).toBe('1');

        await saga.end();
    });

    test('running message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '>>>> ERROR'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x52,
                        0x55,
                        0x4e,
                        0x4e,
                        0x49,
                        0x4e,
                        0x47,
                    ]).buffer,
                ),
            ),
        );

        const action = await saga.take();
        expect(action.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Running,
        );

        await saga.end();
    });

    test('running message with extra text', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        // '0>>>> RUNNING1'
        saga.updateState({ hub: { runtime: HubRuntimeState.Unknown } });
        saga.put(
            notify(
                new DataView(
                    new Uint8Array([
                        0x30,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x3e,
                        0x20,
                        0x52,
                        0x55,
                        0x4e,
                        0x4e,
                        0x49,
                        0x4e,
                        0x47,
                        0x31,
                    ]).buffer,
                ),
            ),
        );

        // this should get split into '0', running status, '1'

        const action1 = await saga.take();
        expect(action1.type).toBe(TerminalActionType.SendData);
        expect((action1 as TerminalDataSendDataAction).value).toBe('0');

        const action2 = await saga.take();
        expect(action2.type).toBe(HubMessageActionType.RuntimeStatus);
        expect((action2 as HubRuntimeStatusMessageAction).newStatus).toBe(
            HubRuntimeStatusType.Running,
        );

        const action3 = await saga.take();
        expect(action3.type).toBe(TerminalActionType.SendData);
        expect((action3 as TerminalDataSendDataAction).value).toBe('1');

        await saga.end();
    });
});

test('Terminal data source responds to send data actions', async () => {
    const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

    saga.put(didStart());
    const dataSourceAction = await saga.take();
    expect(dataSourceAction.type).toBe(TerminalActionType.SetDataSource);

    const dataSource = (dataSourceAction as TerminalSetDataSourceAction).dataSource;
    const data = new Array<string>();
    dataSource.subscribe({ next: (v) => data.push(v) });

    saga.put(sendData('1'));
    saga.put(sendData('2'));
    saga.put(sendData('3'));

    expect(data.length).toBe(3);
    expect(data[0]).toBe('1');
    expect(data[1]).toBe('2');
    expect(data[2]).toBe('3');

    await saga.end();
});

describe('Terminal data source responds to receive data actions', () => {
    // ASCII/UTF-8 encoding of 'test1234'
    const expected = new Uint8Array([0x74, 0x65, 0x73, 0x74, 0x31, 0x32, 0x33, 0x34]);

    test('basic function works', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action.type).toBe(BleUartActionType.Write);
        expect((action as BleUartWriteAction).value).toEqual(expected);

        await saga.end();
    });

    test('messages are queued until previous has completed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(BleUartActionType.Write);
        expect((action as BleUartWriteAction).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(didWrite((action as BleUartWriteAction).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(BleUartActionType.Write);
        expect((action2 as BleUartWriteAction).value).toEqual(expected);

        saga.put(didWrite((action2 as BleUartWriteAction).id));

        await saga.end();
    });

    test('messages are queued until previous has failed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(BleUartActionType.Write);
        expect((action as BleUartWriteAction).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(
            didFailToWrite((action as BleUartWriteAction).id, new Error('test error')),
        );

        const action2 = await saga.take();
        expect(action2.type).toBe(BleUartActionType.Write);
        expect((action2 as BleUartWriteAction).value).toEqual(expected);

        saga.put(didWrite((action2 as BleUartWriteAction).id));

        await saga.end();
    });

    test('small messages are combined', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action.type).toBe(BleUartActionType.Write);
        expect((action as BleUartWriteAction).value).toEqual(
            new Uint8Array([...expected, ...expected]),
        );

        await saga.end();
    });

    test('long messages are split', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.put(receiveData('012345678901234567890123456789'));

        const action = await saga.take();
        expect(action.type).toBe(BleUartActionType.Write);
        expect((action as BleUartWriteAction).value.length).toEqual(20);

        saga.put(didWrite((action as BleUartWriteAction).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(BleUartActionType.Write);
        expect((action2 as BleUartWriteAction).value.length).toEqual(10);

        saga.put(didWrite((action2 as BleUartWriteAction).id));

        await saga.end();
    });
});
