// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum HubRuntimeStatusType {
    Disconnected = 'disconnected',
    Idle = 'idle',
    Loading = 'loading',
    Loaded = 'loaded',
    Running = 'running',
    Error = 'error',
}

export enum HubMessageActionType {
    /**
     * The hub has send a message indicating the MicroPython runtime status changed.
     */
    RuntimeStatus = 'hub.message.action.runtime.status',
    /**
     * The hub has sent a checksum.
     */
    Checksum = 'hub.message.action.runtime.checksum',
}

export interface HubRuntimeStatusMessageAction
    extends Action<HubMessageActionType.RuntimeStatus> {
    readonly newStatus: HubRuntimeStatusType;
}

export function updateStatus(
    newStatus: HubRuntimeStatusType,
): HubRuntimeStatusMessageAction {
    return {
        type: HubMessageActionType.RuntimeStatus,
        newStatus,
    };
}

export interface HubChecksumMessageAction
    extends Action<HubMessageActionType.Checksum> {
    readonly checksum: number;
}

export function checksum(checksum: number): HubChecksumMessageAction {
    return {
        type: HubMessageActionType.Checksum,
        checksum,
    };
}

/**
 * Common type for low-level hub message actions.
 */
export type HubMessageAction = HubRuntimeStatusMessageAction | HubChecksumMessageAction;

/**
 * High-level hub actions.
 */
export enum HubActionType {
    DownloadAndRun = 'hub.action.downloadAndRun',
    Stop = 'hub.action.stop',
    Repl = 'hub.action.repl',
}

export type HubDownloadAndRunAction = Action<HubActionType.DownloadAndRun>;

export function downloadAndRun(): HubDownloadAndRunAction {
    return { type: HubActionType.DownloadAndRun };
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
export type HubAction = HubDownloadAndRunAction | HubStopAction | HubReplAction;
