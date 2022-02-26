// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { createAction } from '../actions';

/**
 * Action that indicates the hub has sent a checksum.
 */
export const checksum = createAction((checksum: number) => ({
    type: 'hub.message.action.runtime.checksum',
    checksum,
}));

// High-level hub actions.

export const downloadAndRun = createAction(() => ({
    type: 'hub.action.downloadAndRun',
}));

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

export const repl = createAction(() => ({
    type: 'hub.action.repl',
}));
