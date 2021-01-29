// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    actionChannel,
    delay,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import PushStream from 'zen-push';
import { Action } from '../actions';
import { AppActionType, AppDidStartAction } from '../app/actions';
import { BleUartActionType, BleUartNotifyAction, write } from '../ble-uart/actions';
import { SafeTxCharLength } from '../ble-uart/protocol';
import { HubRuntimeStatusType, checksum, updateStatus } from '../hub/actions';
import { HubRuntimeState } from '../hub/reducers';
import { RootState } from '../reducers';
import { defined } from '../utils';
import {
    TerminalActionType,
    TerminalDataReceiveDataAction,
    sendData,
    setDataSource,
} from './actions';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const terminalDataSource = new PushStream<string>();

function* startup(_action: AppDidStartAction): Generator {
    yield* put(setDataSource(terminalDataSource.observable));
}

function* handleMatch(
    match: RegExpMatchArray | null,
    status: HubRuntimeStatusType,
): Generator<unknown, boolean> {
    if (!match) {
        return false;
    }

    if (match[1]) {
        yield* put(sendData(match[1]));
    }

    yield* put(updateStatus(status));

    if (match[2]) {
        yield* put(sendData(match[2]));
    }

    return true;
}

function* receiveUartData(action: BleUartNotifyAction): Generator {
    const hubState = yield* select((s: RootState) => s.hub.runtime);

    if (hubState === HubRuntimeState.Loading && action.value.buffer.byteLength === 1) {
        const view = new DataView(action.value.buffer);
        yield* put(checksum(view.getUint8(0)));
        return;
    }

    const value = decoder.decode(action.value.buffer);

    if (
        yield* handleMatch(value.match(/(.*)>>>> IDLE(.*)/), HubRuntimeStatusType.Idle)
    ) {
        return;
    }

    if (
        yield* handleMatch(
            value.match(/(.*)>>>> ERROR(.*)/),
            HubRuntimeStatusType.Error,
        )
    ) {
        return;
    }

    if (
        yield* handleMatch(
            value.match(/(.*)>>>> RUNNING(.*)/),
            HubRuntimeStatusType.Running,
        )
    ) {
        return;
    }

    yield* put(sendData(value));
}

function* receiveTerminalData(): Generator {
    const channel = yield* actionChannel<TerminalDataReceiveDataAction>(
        TerminalActionType.ReceivedData,
    );
    while (true) {
        // wait for input from terminal
        const action = yield* take(channel);
        let value = action.value;

        // Try to collect more data so that we aren't sending just one byte at time
        while (value.length < SafeTxCharLength) {
            const { action, timeout } = yield* race({
                action: take(channel),
                timeout: delay(20),
            });
            if (timeout) {
                break;
            }
            defined(action);
            value += action.value;
        }

        const nextMessageId = yield* getContext<() => number>('nextMessageId');

        // stdin gets piped to BLE connection
        const data = encoder.encode(value);
        for (let i = 0; i < data.length; i += SafeTxCharLength) {
            const { id } = yield* put(
                write(nextMessageId(), data.slice(i, i + SafeTxCharLength)),
            );

            yield* take(
                (a: Action) =>
                    (a.type === BleUartActionType.DidWrite ||
                        a.type === BleUartActionType.DidFailToWrite) &&
                    a.id === id,
            );

            // wait for echo so tht we don't overrun the hub with messages
            yield* race([take(BleUartActionType.Notify), delay(100)]);
        }
    }
}

function sendTerminalData(action: TerminalDataReceiveDataAction): void {
    // This is used to provide a data source for the Terminal component
    terminalDataSource.next(action.value);
}

export default function* (): Generator {
    yield* takeEvery(AppActionType.DidStart, startup);
    yield* takeEvery(BleUartActionType.Notify, receiveUartData);
    yield* fork(receiveTerminalData);
    yield* takeEvery(TerminalActionType.SendData, sendTerminalData);
}
