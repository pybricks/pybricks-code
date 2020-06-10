// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Channel, buffers } from 'redux-saga';
import { actionChannel, fork, put, take, takeEvery } from 'redux-saga/effects';
import PushStream from 'zen-push';
import { Action } from '../actions';
import { BLEDataActionType, BLEDataWriteAction, write } from '../actions/ble';
import {
    TerminalActionType,
    TerminalDataReceiveDataAction,
    setDataSource,
} from '../actions/terminal';

const encoder = new TextEncoder();
const terminalDataSource = new PushStream<string>();

function* receiveTerminalData(): Generator {
    const channel = (yield actionChannel(
        TerminalActionType.ReceivedData,
        buffers.expanding(),
    )) as Channel<TerminalDataReceiveDataAction>;
    while (true) {
        // wait for input from terminal
        const action = (yield take(channel)) as TerminalDataReceiveDataAction;

        // stdin gets piped to BLE connection
        const data = encoder.encode(action.value);
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
        }
    }
}

function sendTerminalData(action: TerminalDataReceiveDataAction): void {
    // This is used to provide a data source for the Terminal component
    terminalDataSource.next(action.value);
}

export default function* (): Generator {
    yield fork(receiveTerminalData);
    yield takeEvery(TerminalActionType.SendData, sendTerminalData);
    yield put(setDataSource(terminalDataSource.observable));
}
