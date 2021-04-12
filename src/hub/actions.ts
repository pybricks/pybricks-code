// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Action } from 'redux';

export enum HubMessageActionType {
    /**
     * The hub has sent a checksum.
     */
    Checksum = 'hub.message.action.runtime.checksum',
}

export type HubChecksumMessageAction = Action<HubMessageActionType.Checksum> & {
    readonly checksum: number;
};

export function checksum(checksum: number): HubChecksumMessageAction {
    return {
        type: HubMessageActionType.Checksum,
        checksum,
    };
}

/**
 * Common type for low-level hub message actions.
 */
export type HubMessageAction = HubChecksumMessageAction;

/**
 * High-level hub actions.
 */
export enum HubActionType {
    DownloadAndRun = 'hub.action.downloadAndRun',
    DidStartDownload = 'hub.action.didStartDownload',
    DidProgressDownload = 'hub.action.didProgressDownload',
    DidFinishDownload = 'hub.action.didFinishDownload',
    DidFailToFinishDownload = 'hub.action.didFailToFinishDownload',
    Stop = 'hub.action.stop',
    Repl = 'hub.action.repl',
}

export type HubDownloadAndRunAction = Action<HubActionType.DownloadAndRun>;

export function downloadAndRun(): HubDownloadAndRunAction {
    return { type: HubActionType.DownloadAndRun };
}

export type HubDidStartDownloadAction = Action<HubActionType.DidStartDownload>;

export function didStartDownload(): HubDidStartDownloadAction {
    return { type: HubActionType.DidStartDownload };
}

export type HubDidProgressDownloadAction = Action<HubActionType.DidProgressDownload> & {
    progress: number;
};

export function didProgressDownload(progress: number): HubDidProgressDownloadAction {
    return { type: HubActionType.DidProgressDownload, progress };
}

export type HubDidFinishDownloadAction = Action<HubActionType.DidFinishDownload>;

export function didFinishDownload(): HubDidFinishDownloadAction {
    return { type: HubActionType.DidFinishDownload };
}

export type HubDidFailToFinishDownloadAction = Action<HubActionType.DidFailToFinishDownload>;

export function didFailToFinishDownload(): HubDidFailToFinishDownloadAction {
    return { type: HubActionType.DidFailToFinishDownload };
}

export type HubStopAction = Action<HubActionType.Stop>;

export function stop(): HubStopAction {
    return { type: HubActionType.Stop };
}

export type HubReplAction = Action<HubActionType.Repl>;

export function repl(): HubReplAction {
    return { type: HubActionType.Repl };
}

/**
 * Common type for all high-level hub actions.
 */
export type HubAction =
    | HubDownloadAndRunAction
    | HubDidStartDownloadAction
    | HubDidProgressDownloadAction
    | HubDidFinishDownloadAction
    | HubDidFailToFinishDownloadAction
    | HubStopAction
    | HubReplAction;
