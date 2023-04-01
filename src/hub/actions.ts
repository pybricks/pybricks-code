// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

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

export const downloadAndRun = createAction(
    (fileFormat: FileFormat | null, useLegacyDownload: boolean) => ({
        type: 'hub.action.downloadAndRun',
        fileFormat,
        useLegacyDownload,
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

export const stop = createAction(() => ({
    type: 'hub.action.stop',
}));

export const hubStartRepl = createAction((useLegacyDownload: boolean) => ({
    type: 'hub.action.startRepl',
    useLegacyDownload,
}));

export const hubDidStartRepl = createAction(() => ({
    type: 'hub.action.didStartRepl',
}));

export const hubDidFailToStartRepl = createAction(() => ({
    type: 'hub.action.didFailToStartRepl',
}));
