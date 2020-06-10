// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { END, MulticastChannel, Saga, Task, runSaga, stdChannel } from 'redux-saga';
import { Action } from '../actions';
import {
    BLEDataActionType,
    BLEDataWriteAction,
    didFailToWrite,
    didWrite,
} from '../actions/ble';
import {
    TerminalActionType,
    TerminalSetDataSourceAction,
    receiveData,
    sendData,
} from '../actions/terminal';
import terminal from './terminal';

class AsyncSaga {
    private dispatches: (Action | END)[];
    private takers: { put: (action: Action | END) => void }[];
    private channel: MulticastChannel<Action>;
    private task: Task;

    public constructor(saga: Saga) {
        this.dispatches = [];
        this.takers = [];
        this.channel = stdChannel();
        this.task = runSaga(
            {
                channel: this.channel,
                dispatch: this.dispatch.bind(this),
                onError: (e) => fail(e),
            },
            saga,
        );
    }

    public numPending(): number {
        return this.dispatches.length;
    }

    public put(action: Action): void {
        this.channel.put(action);
    }

    public take(): Promise<Action> {
        const next = this.dispatches.shift();
        if (next === undefined) {
            // if there are no dispatches queued, then queue the taker to be
            // completed later
            return new Promise((resolve, reject) => {
                this.takers.push({
                    put: (a: Action | END): void => {
                        if (a.type === END.type) {
                            reject();
                        } else {
                            resolve(a);
                        }
                    },
                });
            });
        }
        // otherwise complete immediately
        if (next.type === END.type) {
            return Promise.reject();
        }
        return Promise.resolve(next);
    }

    public async end(): Promise<void> {
        this.task.cancel();
        await this.task.toPromise();
        if (this.dispatches.some((x) => x.type !== END.type)) {
            fail(`unhandled dispatches remain: ${JSON.stringify(this.dispatches)}`);
        }
    }

    private dispatch(action: Action | END): Action | END {
        const taker = this.takers.shift();
        if (taker === undefined) {
            // if there are no takers waiting, the queue the action
            this.dispatches.push(action);
        } else {
            // otherwise complete the promise
            taker.put(action);
        }
        return action;
    }
}

test('Terminal data source responds to send data actions', async () => {
    const saga = new AsyncSaga(terminal);

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
        const saga = new AsyncSaga(terminal);

        // set data source is always first action so we have to take it
        const dataSourceAction = await saga.take();
        expect(dataSourceAction.type).toBe(TerminalActionType.SetDataSource);

        saga.put(receiveData('test1234'));

        const action = await saga.take();
        expect(action.type).toBe(BLEDataActionType.Write);
        expect((action as BLEDataWriteAction).value).toEqual(expected);

        await saga.end();
    });

    test('messages are queued until previous has completed', async () => {
        const saga = new AsyncSaga(terminal);

        // set data source is always first action so we have to take it
        const dataSourceAction = await saga.take();
        expect(dataSourceAction.type).toBe(TerminalActionType.SetDataSource);

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(BLEDataActionType.Write);
        expect((action as BLEDataWriteAction).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(didWrite((action as BLEDataWriteAction).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(BLEDataActionType.Write);
        expect((action2 as BLEDataWriteAction).value).toEqual(expected);

        saga.put(didWrite((action2 as BLEDataWriteAction).id));

        await saga.end();
    });

    test('messages are queued until previous has failed', async () => {
        const saga = new AsyncSaga(terminal);

        // set data source is always first action so we have to take it
        const dataSourceAction = await saga.take();
        expect(dataSourceAction.type).toBe(TerminalActionType.SetDataSource);

        saga.put(receiveData('test1234'));
        saga.put(receiveData('test1234'));

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(1);

        const action = await saga.take();
        expect(action.type).toBe(BLEDataActionType.Write);
        expect((action as BLEDataWriteAction).value).toEqual(expected);

        // second message is queued until didWrite or didFailToWrite
        expect(saga.numPending()).toBe(0);

        saga.put(
            didFailToWrite((action as BLEDataWriteAction).id, new Error('test error')),
        );

        const action2 = await saga.take();
        expect(action2.type).toBe(BLEDataActionType.Write);
        expect((action2 as BLEDataWriteAction).value).toEqual(expected);

        saga.put(didWrite((action2 as BLEDataWriteAction).id));

        await saga.end();
    });

    test('long messages are split', async () => {
        const saga = new AsyncSaga(terminal);

        // set data source is always first action so we have to take it
        const dataSourceAction = await saga.take();
        expect(dataSourceAction.type).toBe(TerminalActionType.SetDataSource);

        saga.put(receiveData('012345678901234567890123456789'));

        const action = await saga.take();
        expect(action.type).toBe(BLEDataActionType.Write);
        expect((action as BLEDataWriteAction).value.length).toEqual(20);

        saga.put(didWrite((action as BLEDataWriteAction).id));

        const action2 = await saga.take();
        expect(action2.type).toBe(BLEDataActionType.Write);
        expect((action2 as BLEDataWriteAction).value.length).toEqual(10);

        saga.put(didWrite((action2 as BLEDataWriteAction).id));

        await saga.end();
    });
});
