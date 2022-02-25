// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import PushStream from 'zen-push';
import { AsyncSaga, delay } from '../../test';
import {
    didFailToWrite,
    didNotify,
    didWrite,
    write,
} from '../ble-nordic-uart-service/actions';
import { checksum } from '../hub/actions';
import { HubRuntimeState } from '../hub/reducers';
import { createCountFunc } from '../utils/iter';
import { receiveData, sendData } from './actions';
import terminal from './sagas';

describe('Data receiver filters out hub status', () => {
    test('normal message - no status', async () => {
        const saga = new AsyncSaga(
            terminal,
            { hub: { runtime: HubRuntimeState.Unknown } },
            { nextMessageId: createCountFunc() },
        );

        // sending ASCII space character
        saga.put(didNotify(new DataView(new Uint8Array([0x20]).buffer)));

        const action = await saga.take();
        expect(action.type).toBe(sendData.toString());
        expect((action as ReturnType<typeof sendData>).value).toBe(' ');

        await saga.end();
    });

    test('checksum message', async () => {
        const saga = new AsyncSaga(
            terminal,
            { hub: { runtime: HubRuntimeState.Loading } },
            { nextMessageId: createCountFunc() },
        );

        saga.put(didNotify(new DataView(new Uint8Array([0xaa]).buffer)));

        const action = await saga.take();
        expect(action.type).toBe(checksum.toString());
        expect((action as ReturnType<typeof checksum>).checksum).toBe(0xaa);

        await saga.end();
    });
});

test('Terminal data source responds to send data actions', async () => {
    const dataSource = new PushStream<string>();
    const saga = new AsyncSaga(
        terminal,
        {},
        { nextMessageId: createCountFunc(), terminal: { dataSource } },
    );

    const data = new Array<string>();
    dataSource.observable.subscribe({ next: (v) => data.push(v) });

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
        const saga = new AsyncSaga(terminal, {}, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action.type).toBe(write.toString());
        expect((action as ReturnType<typeof write>).value).toEqual(expected);

        await saga.end();
    });

    test('messages are queued until previous has completed', async () => {
        const saga = new AsyncSaga(terminal, {}, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(write.toString());
        expect((action as ReturnType<typeof write>).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(didWrite((action as ReturnType<typeof write>).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(write.toString());
        expect((action2 as ReturnType<typeof write>).value).toEqual(expected);

        saga.put(didWrite((action2 as ReturnType<typeof write>).id));

        await saga.end();
    });

    test('messages are queued until previous has failed', async () => {
        const saga = new AsyncSaga(terminal, {}, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(write.toString());
        expect((action as ReturnType<typeof write>).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(
            didFailToWrite(
                (action as ReturnType<typeof write>).id,
                new Error('test error'),
            ),
        );

        const action2 = await saga.take();
        expect(action2.type).toBe(write.toString());
        expect((action2 as ReturnType<typeof write>).value).toEqual(expected);

        saga.put(didWrite((action2 as ReturnType<typeof write>).id));

        await saga.end();
    });

    test('small messages are combined', async () => {
        const saga = new AsyncSaga(terminal, {}, { nextMessageId: createCountFunc() });

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action.type).toBe(write.toString());
        expect((action as ReturnType<typeof write>).value).toEqual(
            new Uint8Array([...expected, ...expected]),
        );

        await saga.end();
    });

    test('long messages are split', async () => {
        const saga = new AsyncSaga(terminal, {}, { nextMessageId: createCountFunc() });

        saga.put(receiveData('012345678901234567890123456789'));

        const action = await saga.take();
        expect(action.type).toBe(write.toString());
        expect((action as ReturnType<typeof write>).value.length).toEqual(20);

        saga.put(didWrite((action as ReturnType<typeof write>).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(write.toString());
        expect((action2 as ReturnType<typeof write>).value.length).toEqual(10);

        saga.put(didWrite((action2 as ReturnType<typeof write>).id));

        await saga.end();
    });
});
