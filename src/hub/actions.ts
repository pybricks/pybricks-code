// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import { createAction } from '../actions';
import { FileFormat } from '../ble-pybricks-service/protocol';

/**
 * Action that indicates the hub has sent a checksum.
 */
export const checksum = createAction((checksum: number) => ({
    type: 'hub.message.action.runtime.checksum',
    checksum,
}));

// High-level hub actions.

/**
 * Request to download and run a program on the hub.
 * @param fileFormat The format of the file to download.
 * @param useLegacyDownload Whether to use the legacy NUS download method.
 * @param useLegacyStartUserProgram Whether to use the legacy start user program method (changed in protocol v1.4.0).
 * @param slot The slot number to download the program to - only valid on hubs/firmware that support multiple slots.
 */
export const downloadAndRun = createAction(
    (
        fileFormat: FileFormat | null,
        useLegacyDownload: boolean,
        useLegacyStartUserProgram: boolean,
        slot: number,
    ) => ({
        type: 'hub.action.downloadAndRun',
        fileFormat,
        useLegacyDownload,
        useLegacyStartUserProgram,
        slot,
    }),
);

export const didStartDownload = createAction(() => ({
    type: 'hub.action.didStartDownload',
}));

export const didProgressDownload = createAction((progress: number) => ({
    type: 'hub.action.didProgressDownload',
    progress,
}));

export const didFinishDownload = createAction(() => ({
    type: 'hub.action.didFinishDownload',
}));

export const didFailToFinishDownload = createAction(() => ({
    type: 'hub.action.didFailToFinishDownload',
}));

/** Request to send the stop user program command to the hub. */
export const hubStopUserProgram = createAction(() => ({
    type: 'hub.action.stopUserProgram',
}));

/** Indicates the the stop user program command was sent to the hub. */
export const hubDidStopUserProgram = createAction(() => ({
    type: 'hub.action.didStopUserProgram',
}));

/** Indicates the the stop user program command failed to be sent to the hub. */
export const hubDidFailToStopUserProgram = createAction(() => ({
    type: 'hub.action.didFailToStopUserProgram',
}));

/**
 * Request to send the start repl command to the hub.
 * @param useLegacyDownload Whether to use the legacy NUS download method.
 * @param useLegacyStartUserProgram Whether to use the legacy start user program method (changed in protocol v1.4.0).
 */
export const hubStartRepl = createAction(
    (useLegacyDownload: boolean, useLegacyStartUserProgram: boolean) => ({
        type: 'hub.action.startRepl',
        useLegacyDownload,
        useLegacyStartUserProgram,
    }),
);

/** Indicates the the start repl command was sent to the hub. */
export const hubDidStartRepl = createAction(() => ({
    type: 'hub.action.didStartRepl',
}));

/** Indicates the the start repl command failed to be sent to the hub. */
export const hubDidFailToStartRepl = createAction(() => ({
    type: 'hub.action.didFailToStartRepl',
}));
