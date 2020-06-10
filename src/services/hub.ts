// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { EventEmitter } from 'events';
import { Action, Dispatch } from '../actions';
import {
    BLEDataAction,
    BLEDataActionType,
    BLEDataDidFailToWriteAction,
    BLEDataDidWriteAction,
    write,
} from '../actions/ble';
import { HubActionType, HubRuntimeStatusType, updateStatus } from '../actions/hub';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../actions/mpy';
import { getChecksum } from '../epics/hub';
import { RootState } from '../reducers';
import { combineServices } from '.';

// TODO: this file needs to be converted to a saga

const downloadChunkSize = 100;

const compiler = new EventEmitter();

function didCompile(action: Action): void {
    if (action.type === MpyActionType.DidCompile) {
        compiler.emit('didCompile', action);
    }
    if (action.type === MpyActionType.DidFailToCompile) {
        compiler.emit('didFailToCompile', action);
    }
}

const writer = new EventEmitter();

function didWrite(action: Action): void {
    if (action.type === BLEDataActionType.DidWrite) {
        writer.emit('didWrite', action);
    }
    if (action.type === BLEDataActionType.DidFailToWrite) {
        writer.emit('didFailToWrite', action);
    }
}

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

    dispatch(compile(script, ['-mno-unicode']));
    const mpy = await new Promise<MpyDidCompileAction>((resolve, reject): void => {
        compiler.on('didCompile', (a: MpyDidCompileAction): void => resolve(a));
        compiler.on('didFailToCompile', (a: MpyDidFailToCompileAction) =>
            reject(new Error(a.err)),
        );
    });
    compiler.removeAllListeners();

    // let everyone know the runtime is busy loading the program
    dispatch(updateStatus(HubRuntimeStatusType.Loading));

    // TODO: might need to flush checksum queue here

    // first send payload size as big-endian 32-bit integer
    const checksum = getChecksum();
    const sizeBuf = new Uint8Array(4);
    const sizeView = new DataView(sizeBuf.buffer);
    sizeView.setUint32(0, mpy.data.byteLength, true);
    dispatch(write(sizeBuf));
    await new Promise<BLEDataAction>((resolve, reject): void => {
        writer.on('didWrite', (a: BLEDataDidWriteAction): void => resolve(a));
        writer.on('didFailToWrite', (a: BLEDataDidFailToWriteAction) => reject(a.err));
    });
    writer.removeAllListeners();

    // TODO: verify checksum
    console.log(await checksum);

    // Then send payload in 100 byte chunks waiting for checksum after
    // each chunk
    for (let i = 0; i < mpy.data.byteLength; i += downloadChunkSize) {
        // need to subscribe to checksum before writing to prevent race condition
        const checksum = getChecksum();
        const chunk = mpy.data.slice(i, i + downloadChunkSize);

        // we can actually only write 20 bytes at a time
        for (let j = 0; j < chunk.length; j += 20) {
            dispatch(write(chunk.slice(j, j + 20)));
            await new Promise<BLEDataAction>((resolve, reject): void => {
                writer.on('didWrite', (a: BLEDataDidWriteAction): void => resolve(a));
                writer.on('didFailToWrite', (a: BLEDataDidFailToWriteAction) =>
                    reject(a.err),
                );
            });
            writer.removeAllListeners();
        }

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

export default combineServices(didCompile, didWrite, downloadAndRun, startRepl, stop);
