// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Channel } from 'redux-saga';
import {
    actionChannel,
    delay,
    fork,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'redux-saga/effects';
import PushStream from 'zen-push';
import { Action } from '../actions';
import {
    BLEDataActionType,
    BLEDataNotifyAction,
    BLEDataWriteAction,
    write,
} from '../actions/ble';
import { HubRuntimeStatusType, checksum, updateStatus } from '../actions/hub';
import {
    TerminalActionType,
    TerminalDataReceiveDataAction,
    sendData,
    setDataSource,
} from '../actions/terminal';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const terminalDataSource = new PushStream<string>();

function* handleMatch(
    match: RegExpMatchArray | null,
    status: HubRuntimeStatusType,
): Generator<unknown, boolean> {
    if (!match) {
        return false;
    }

    if (match[1]) {
        yield put(sendData(match[1]));
    }

    yield put(updateStatus(status));

    if (match[2]) {
        yield put(sendData(match[2]));
    }

    return true;
}

function* receiveUartData(action: BLEDataNotifyAction): Generator {
    const hubState = (yield select((s: RootState) => s.hub.runtime)) as HubRuntimeState;

    if (hubState === HubRuntimeState.Loading && action.value.buffer.byteLength === 1) {
        const view = new DataView(action.value.buffer);
        yield put(checksum(view.getUint8(0)));
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

    yield put(sendData(value));
}

function* receiveTerminalData(): Generator {
    const channel = (yield actionChannel(TerminalActionType.ReceivedData)) as Channel<
        TerminalDataReceiveDataAction
    >;
    while (true) {
        // wait for input from terminal
        const action = (yield take(channel)) as TerminalDataReceiveDataAction;
        let value = action.value;

        // Try to collect more data so that we aren't sending just one byte at time
        while (value.length < 20) {
            const [action, timeout] = (yield race([take(channel), delay(20)])) as [
                TerminalDataReceiveDataAction,
                boolean,
            ];
            if (timeout) {
                break;
            }
            value += action.value;
        }

        // stdin gets piped to BLE connection
        const data = encoder.encode(value);
        for (let i = 0; i < data.length; i += 20) {
            const { id } = (yield put(
                write(data.slice(i, i + 20)),
            )) as BLEDataWriteAction;

            yield take(
                (a: Action) =>
                    (a.type === BLEDataActionType.DidWrite ||
                        a.type === BLEDataActionType.DidFailToWrite) &&
                    a.id === id,
            );

            // wait for echo so tht we don't overrun the hub with messages
            yield race([take(BLEDataActionType.Notify), delay(100)]);
        }
    }
}

function sendTerminalData(action: TerminalDataReceiveDataAction): void {
    // This is used to provide a data source for the Terminal component
    terminalDataSource.next(action.value);
}

export default function* (): Generator {
    yield takeEvery(BLEDataActionType.Notify, receiveUartData);
    yield fork(receiveTerminalData);
    yield takeEvery(TerminalActionType.SendData, sendTerminalData);
    yield put(setDataSource(terminalDataSource.observable));
}
