// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

// import { AnyAction } from 'redux';
import { getContext, put, takeEvery } from 'typed-redux-saga/macro';
import {
    didReceiveWriteAppData,
    sendStartUserProgramCommand,
    sendStopUserProgramCommand,
} from '../ble-pybricks-service/actions';
import { HubCenterContextValue } from './HubCenterContext';
import { hubcenterHideDialog, hubcenterShowDialog, sendData } from './actions';

/**
 * Partial saga context type for context used in the terminal sagas.
 */
export type HubcenterSagaContext = { hubcenter: HubCenterContextValue };

// const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PORTVIEW_PROGRAM_ID = 129;

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

function* processShowDialog(
    _action: ReturnType<typeof hubcenterShowDialog>,
): Generator {
    yield* put(sendStartUserProgramCommand(PORTVIEW_PROGRAM_ID));
}

function* processHideDialog(
    _action: ReturnType<typeof hubcenterShowDialog>,
): Generator {
    yield* put(sendStopUserProgramCommand(0));
}

export default function* (): Generator {
    yield* takeEvery(didReceiveWriteAppData, handleReceiveWriteAppData);
    yield* takeEvery(sendData, sendHubcenterData);
    yield* takeEvery(hubcenterShowDialog, processShowDialog);
    yield* takeEvery(hubcenterHideDialog, processHideDialog);
}
