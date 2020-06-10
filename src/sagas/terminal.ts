// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { put, takeEvery } from 'redux-saga/effects';
import PushStream from 'zen-push';
import { write } from '../actions/ble';
import {
    TerminalActionType,
    TerminalDataReceiveDataAction,
    TerminalDataSendDataAction,
    setDataSource,
} from '../actions/terminal';

const encoder = new TextEncoder();
const terminalDataSource = new PushStream<string>();

function* receiveTerminalData(action: TerminalDataSendDataAction): Generator {
    // stdin gets piped to BLE connection
    yield put(write(encoder.encode(action.value)));
}

function sendTerminalData(action: TerminalDataReceiveDataAction): void {
    // This is used to provide a data source for the Terminal component
    terminalDataSource.next(action.value);
}

export default function* (): Generator {
    yield takeEvery(TerminalActionType.ReceivedData, receiveTerminalData);
    yield takeEvery(TerminalActionType.SendData, sendTerminalData);
    yield put(setDataSource(terminalDataSource.observable));
}
