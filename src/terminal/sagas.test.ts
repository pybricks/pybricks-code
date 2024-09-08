// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import PushStream from 'zen-push';
import { AsyncSaga, delay } from '../../test';
import {
    didFailToWrite,
    didNotify,
    didWrite,
    write,
} from '../ble-nordic-uart-service/actions';
import {
    didFailToSendCommand,
    didReceiveWriteStdout,
    didSendCommand,
    sendWriteStdinCommand,
} from '../ble-pybricks-service/actions';
import { checksum, hubDidStartRepl } from '../hub/actions';
import { HubRuntimeState } from '../hub/reducers';
import { createCountFunc } from '../utils/iter';
import { receiveData, sendData } from './actions';
import terminal from './sagas';

const encoder = new TextEncoder();

describe('receiving stdout from hub', () => {
    test('legacy UART message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({ hub: { useLegacyDownload: true, useLegacyStdio: true } });

        // sending ASCII space character
        saga.put(didNotify(new DataView(new Uint8Array([0x20]).buffer)));

        await expect(saga.take()).resolves.toEqual(sendData(' '));

        await saga.end();
    });

    test('legacy download checksum message', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Loading,
                useLegacyDownload: true,
                useLegacyStdio: true,
            },
        });

        saga.put(didNotify(new DataView(new Uint8Array([0xaa]).buffer)));

        await expect(saga.take()).resolves.toEqual(checksum(0xaa));

        await saga.end();
    });

    test('Pybricks Profile v1.3.0 ignores UART service', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.updateState({
            hub: {
                useLegacyDownload: false,
                useLegacyStdio: false,
            },
        });

        saga.put(didNotify(new DataView(new Uint8Array([0x20]).buffer)));

        await delay(50);

        // no further actions should be pending
        await saga.end();
    });

    test('Pybricks Profile v1.3.0 write stdout command', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });

        saga.updateState({
            hub: {
                useLegacyDownload: false,
                useLegacyStdio: false,
            },
        });

        saga.put(didReceiveWriteStdout(new Uint8Array([0x20]).buffer));

        await expect(saga.take()).resolves.toEqual(sendData(' '));

        // ensure that unicode characters are handled correctly when split
        // across buffers

        saga.put(didReceiveWriteStdout(new Uint8Array([0xe4]).buffer));
        await expect(saga.take()).resolves.toEqual(sendData(''));
        saga.put(didReceiveWriteStdout(new Uint8Array([0xb8, 0xad]).buffer));
        await expect(saga.take()).resolves.toEqual(sendData('中'));

        await saga.end();
    });
});

test('Terminal data source responds to send data actions', async () => {
    const dataSource = new PushStream<string>();
    const saga = new AsyncSaga(terminal, {
        nextMessageId: createCountFunc(),
        terminal: { dataSource },
    });

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
    const expected = encoder.encode('test1234');

    test('basic function works', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Running,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData('test1234'));

        await expect(saga.take()).resolves.toEqual(sendWriteStdinCommand(0, expected));

        await saga.end();
    });

    test('messages are queued until previous has completed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Running,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didSend or didFailToSend
        expect(saga.numPending()).toBe(1);

        await expect(saga.take()).resolves.toEqual(sendWriteStdinCommand(0, expected));

        // second message is queued until didSend or didFailToSend
        expect(saga.numPending()).toBe(0);

        saga.put(didSendCommand(0));

        await expect(saga.take()).resolves.toEqual(sendWriteStdinCommand(1, expected));

        saga.put(didSendCommand(1));

        await saga.end();
    });

    test('messages are queued until previous has failed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Running,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didSend or didFailToSend
        expect(saga.numPending()).toBe(1);

        await expect(saga.take()).resolves.toEqual(sendWriteStdinCommand(0, expected));

        // second message is queued until didSend or didFailToSend
        expect(saga.numPending()).toBe(0);

        saga.put(didFailToSendCommand(0, new Error('test error')));

        await expect(saga.take()).resolves.toEqual(sendWriteStdinCommand(1, expected));

        saga.put(didSendCommand(1));

        await saga.end();
    });

    test('small messages are combined', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Running,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        await expect(saga.take()).resolves.toEqual(
            sendWriteStdinCommand(0, new Uint8Array([...expected, ...expected])),
        );

        await saga.end();
    });

    test('long messages are split', async () => {
        const testData = '012345678901234567890123456789';

        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Running,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData(testData));

        await expect(saga.take()).resolves.toEqual(
            sendWriteStdinCommand(0, encoder.encode(testData.slice(0, 20))),
        );

        saga.put(didSendCommand(0));

        await expect(saga.take()).resolves.toEqual(
            sendWriteStdinCommand(1, encoder.encode(testData.slice(20, 40))),
        );

        saga.put(didSendCommand(1));

        await saga.end();
    });

    test('if user program is not running echo BEL', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: {
                runtime: HubRuntimeState.Disconnected,
                useLegacyStdio: false,
                maxBleWriteSize: 20,
            },
        });

        saga.put(receiveData('test1234'));

        await delay(50);

        // sends BEL character on error
        await expect(saga.take()).resolves.toEqual(sendData('\x07'));

        await saga.end();
    });
});

describe('Terminal data source responds to receive data actions (legacy)', () => {
    const expected = encoder.encode('test1234');

    test('basic function works', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Running, useLegacyStdio: true },
        });

        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action).toEqual(write(0, expected));

        await saga.end();
    });

    test('messages are queued until previous has completed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Running, useLegacyStdio: true },
        });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action).toEqual(write(0, expected));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(didWrite(0));

        const action2 = await saga.take();
        expect(action2).toEqual(write(1, expected));

        saga.put(didWrite(1));

        await saga.end();
    });

    test('messages are queued until previous has failed', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Running, useLegacyStdio: true },
        });

        saga.put(receiveData('test1234'));
        await delay(50); // without delay, messages are combined
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action).toEqual(write(0, expected));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(didFailToWrite(0, new Error('test error')));

        const action2 = await saga.take();
        expect(action2).toEqual(write(1, expected));

        saga.put(didWrite(1));

        await saga.end();
    });

    test('small messages are combined', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Running, useLegacyStdio: true },
        });

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action).toEqual(write(0, new Uint8Array([...expected, ...expected])));

        await saga.end();
    });

    test('long messages are split', async () => {
        const testData = '012345678901234567890123456789';

        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Running, useLegacyStdio: true },
        });

        saga.put(receiveData(testData));

        const action = await saga.take();
        expect(action).toEqual(write(0, encoder.encode(testData.slice(0, 20))));

        saga.put(didWrite(0));

        const action2 = await saga.take();
        expect(action2).toEqual(write(1, encoder.encode(testData.slice(20, 40))));

        saga.put(didWrite(1));

        await saga.end();
    });

    test('if user program is not running, echo BEL', async () => {
        const saga = new AsyncSaga(terminal, { nextMessageId: createCountFunc() });
        saga.updateState({
            hub: { runtime: HubRuntimeState.Disconnected, useLegacyStdio: true },
        });

        saga.put(receiveData('test1234'));

        await delay(50);

        // sends BEL character on error
        await expect(saga.take()).resolves.toEqual(sendData('\x07'));

        await saga.end();
    });
});

it('should focus terminal when repl is started', async () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    const saga = new AsyncSaga(terminal);

    saga.put(hubDidStartRepl());

    // https://stackoverflow.com/a/64787979/1976323
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('pb-terminal-focus');

    await saga.end();
});
