// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

// import { AnyAction } from 'redux';
import { getContext, put, takeEvery } from 'typed-redux-saga/macro';
import {
    didReceiveWriteAppData,
    sendStartUserProgramCommand,
    sendStopUserProgramCommand,
    sendWriteAppDataCommand,
} from '../ble-pybricks-service/actions';
import { HubCenterContextValue } from './HubCenterContext';
import {
    executeAppDataCommand,
    hubcenterHideDialog,
    hubcenterShowDialog,
    sendData,
} from './actions';

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
    const value = decoder.decode(action.payload, { stream: true });
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
    yield* put(sendStartUserProgramCommand(0, PORTVIEW_PROGRAM_ID));
}

function* processHideDialog(
    _action: ReturnType<typeof hubcenterShowDialog>,
): Generator {
    yield* put(sendStopUserProgramCommand(0));
}

let packet_counter = 0;
function* processExecuteAppDataCommand(
    _action: ReturnType<typeof executeAppDataCommand>,
): Generator {
    console.log('processExecuteAppDataCommand');
    packet_counter = (packet_counter + 1) & 0xff;
    const VERSION = 0x01;

    const payloadBuffer = _action.value;
    const payloadBufferView = new Uint8Array(payloadBuffer);
    const prefixBuffer = new Uint8Array([VERSION, packet_counter]);

    const newBuffer = new ArrayBuffer(
        prefixBuffer.byteLength + payloadBuffer.byteLength,
    );
    const msg = new Uint8Array(newBuffer);

    msg.set(prefixBuffer, 0);
    msg.set(payloadBufferView, prefixBuffer.byteLength);
    console.log('>>>', msg, _action.value);

    yield* put(sendWriteAppDataCommand(0, 0, msg));
}

export default function* (): Generator {
    yield* takeEvery(didReceiveWriteAppData, handleReceiveWriteAppData);
    yield* takeEvery(sendData, sendHubcenterData);
    yield* takeEvery(executeAppDataCommand, processExecuteAppDataCommand);
    yield* takeEvery(hubcenterShowDialog, processShowDialog);
    yield* takeEvery(hubcenterHideDialog, processHideDialog);
}
