// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from '../actions';
import { write } from '../actions/ble';
import { HubActionType, HubRuntimeStatusType, updateStatus } from '../actions/hub';
import { compile } from '../actions/mpy';
import { getChecksum } from '../epics/hub';
import { RootState } from '../reducers';
import { combineServices } from '.';

// TODO: this file needs to be converted to a saga

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

const downloadChunkSize = 100;

async function downloadAndRun(
    action: Action,
    dispatch: Dispatch,
    state: RootState,
): Promise<void> {
    if (action.type !== HubActionType.DownloadAndRun) {
        return;
    }

    const script = state.editor.current?.getValue();
    // istanbul ignore next: it should not be possible to trigger this action without a current editor
    if (script === undefined) {
        console.log('no current editor');
        return;
    }
    const mpy = await dispatch(compile(script, ['-mno-unicode']));
    if (mpy.data === undefined) {
        console.log(`failed to compile: ${mpy.err}`);
        return;
    }

    // let everyone know the runtime is busy loading the program
    dispatch(updateStatus(HubRuntimeStatusType.Loading));

    // TODO: might need to flush checksum queue here

    // first send payload size as big-endian 32-bit integer
    const checksum = getChecksum();
    const sizeBuf = new Uint8Array(4);
    const sizeView = new DataView(sizeBuf.buffer);
    sizeView.setUint32(0, mpy.data.byteLength, true);
    await dispatch(write(sizeBuf));
    // TODO: verify checksum
    console.log(await checksum);

    // Then send payload in 100 byte chunks waiting for checksum after
    // each chunk
    for (let i = 0; i < mpy.data.byteLength; i += downloadChunkSize) {
        // need to subscribe to checksum before writing to prevent race condition
        const checksum = getChecksum();
        await dispatch(write(mpy.data.slice(i, i + downloadChunkSize)));
        // TODO: verify checksum
        console.log(await checksum);
        // TODO: dispatch progress
    }

    // let everyone know the runtime is done loading the program
    dispatch(updateStatus(HubRuntimeStatusType.Loaded));
}

// SPACE, SPACE, SPACE, SPACE
const startReplCommand = new Uint8Array([0x20, 0x20, 0x20, 0x20]);

function startRepl(action: Action, dispatch: Dispatch): void {
    if (action.type !== HubActionType.Repl) {
        return;
    }
    dispatch(write(startReplCommand));
}

// CTRL+C, CTRL+C, CTRL+D
const stopCommand = new Uint8Array([0x03, 0x03, 0x04]);

function stop(action: Action, dispatch: Dispatch): void {
    if (action.type !== HubActionType.Stop) {
        return;
    }
    dispatch(write(stopCommand));
}

export default combineServices(downloadAndRun, startRepl, stop);
