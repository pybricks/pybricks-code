// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

// import { AnyAction } from 'redux';
import {
    getContext,
    // actionChannel,
    // delay,
    // fork,
    // getContext,
    put,
    // race,
    // select,
    // take,
    takeEvery,
} from 'typed-redux-saga/macro';
// import {
//     didFailToWrite,
//     didNotify,
//     didWrite,
//     write,
// } from '../ble-nordic-uart-service/actions';
// import { nordicUartSafeTxCharLength } from '../ble-nordic-uart-service/protocol';
import {
    // didFailToSendCommand,
    didReceiveWriteAppData,
    // didSendCommand,
    // sendWriteStdinCommand,
} from '../ble-pybricks-service/actions';
// import { checksum, hubDidStartRepl } from '../hub/actions';
// import { HubRuntimeState } from '../hub/reducers';
// import { RootState } from '../reducers';
// import { assert, defined } from '../utils';
import { HubCenterContextValue } from './HubCenterContext';
import { sendData } from './actions';

/**
 * Partial saga context type for context used in the terminal sagas.
 */
export type HubcenterSagaContext = { hubcenter: HubCenterContextValue };

// const encoder = new TextEncoder();
const decoder = new TextDecoder();

function* handleReceiveWriteAppData(
    action: ReturnType<typeof didReceiveWriteAppData>,
): Generator {
    const value = decoder.decode(action.payload);
    yield* put(sendData(value));
}

function* sendHubcenterData(action: ReturnType<typeof sendData>): Generator {
    const { dataSource } = yield* getContext<HubCenterContextValue>('hubcenter');
    // This is used to provide a data source for the Terminal component
    dataSource.next(action.value);
}

export default function* (): Generator {
    yield* takeEvery(didReceiveWriteAppData, handleReceiveWriteAppData);
    yield* takeEvery(sendData, sendHubcenterData);
}
