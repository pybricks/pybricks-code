import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { getChecksum } from '../epics/hub';
import { write } from './ble';

export type HubThunkAction = ThunkAction<Promise<void>, {}, {}, HubRuntimeStatusAction>;

export enum HubRuntimeStatusType {
    Disconnected = 'disconnected',
    Idle = 'idle',
    Loading = 'loading',
    Loaded = 'loaded',
    Running = 'running',
    Error = 'error',
}

export enum HubActionType {
    /**
     * MicroPython runtime status changed.
     */
    RuntimeStatus = 'hub.runtime.status',
    /**
     * The hub has sent a checksum.
     */
    Checksum = 'hub.runtime.checksum',
}

export interface HubRuntimeStatusAction extends Action<HubActionType.RuntimeStatus> {
    readonly newStatus: HubRuntimeStatusType;
}

export interface HubChecksumAction extends Action<HubActionType.Checksum> {
    readonly checksum: number;
}

export function updateStatus(newStatus: HubRuntimeStatusType): HubRuntimeStatusAction {
    return {
        type: HubActionType.RuntimeStatus,
        newStatus,
    };
}

export function checksum(checksum: number): HubChecksumAction {
    return {
        type: HubActionType.Checksum,
        checksum,
    };
}

const downloadChunkSize = 100;

export function downloadAndRun(data: ArrayBuffer): HubThunkAction {
    return async function (dispatch): Promise<void> {
        // let everyone know the runtime is busy loading the program
        dispatch(updateStatus(HubRuntimeStatusType.Loading));

        // TODO: might need to flush checksum queue here

        // first send payload size as big-endian 32-bit integer
        const sizeBuf = new Uint8Array(4);
        const sizeView = new DataView(sizeBuf.buffer);
        sizeView.setUint32(0, data.byteLength);
        await dispatch(write(sizeBuf));

        // Then send payload in 100 byte chunks waiting for checksum after
        // each chunk
        for (let i = 0; i < data.byteLength; i += downloadChunkSize) {
            // need to subscribe to checksum before writing to prevent race condition
            const checksum = getChecksum();
            await dispatch(write(data.slice(i, i + downloadChunkSize)));
            // TODO: verify checksum
            console.log(await checksum);
            // TODO: dispatch progress
        }

        // let everyone know the runtime is done loading the program
        dispatch(updateStatus(HubRuntimeStatusType.Loaded));
    };
}
