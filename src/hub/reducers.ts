// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { didConnect, didDisconnect } from '../ble/actions';
import {
    didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
} from './actions';

/**
 * Describes the state of the MicroPython runtime on the hub.
 */
export enum HubRuntimeState {
    /**
     * The hub is not connected.
     */
    Disconnected = 'hub.runtime.disconnected',
    /**
     * The hub is connected but the state is not known yet.
     */
    Unknown = 'hub.runtime.unknown',
    /**
     * The runtime is idle waiting for command after soft reboot.
     */
    Idle = 'hub.runtime.idle',
    /**
     * A user program is being copied to the hub.
     */
    Loading = 'hub.runtime.loading',
    /**
     * A user program has been copied to the hub.
     */
    Loaded = 'hub.runtime.loaded',
    /**
     * A user program is running.
     */
    Running = 'hub.runtime.running',
}

const runtime: Reducer<HubRuntimeState> = (
    state = HubRuntimeState.Disconnected,
    action,
) => {
    if (didConnect.matches(action)) {
        return HubRuntimeState.Unknown;
    }

    if (didDisconnect.matches(action)) {
        return HubRuntimeState.Disconnected;
    }

    if (didStartDownload.matches(action)) {
        // disconnected overrides download
        if (state === HubRuntimeState.Disconnected) {
            return state;
        }
        return HubRuntimeState.Loading;
    }

    if (didFinishDownload.matches(action)) {
        // disconnected overrides download
        if (state === HubRuntimeState.Disconnected) {
            return state;
        }
        return HubRuntimeState.Loaded;
    }

    if (didFailToFinishDownload.matches(action)) {
        // disconnected overrides download
        if (state === HubRuntimeState.Disconnected) {
            return state;
        }
        return HubRuntimeState.Idle;
    }

    if (didReceiveStatusReport.matches(action)) {
        // The loading state is determined solely by the IDE, so we can't
        // let the hub status interfere with it.
        if (
            state === HubRuntimeState.Disconnected ||
            state === HubRuntimeState.Loading
        ) {
            return state;
        }

        if (action.statusFlags & statusToFlag(Status.UserProgramRunning)) {
            return HubRuntimeState.Running;
        }

        return HubRuntimeState.Idle;
    }

    return state;
};

const downloadProgress: Reducer<number | null> = (state = null, action) => {
    if (didStartDownload.matches(action)) {
        return 0;
    }

    if (didProgressDownload.matches(action)) {
        return action.progress;
    }

    if (didFinishDownload.matches(action)) {
        return 1;
    }

    if (didFailToFinishDownload.matches(action)) {
        return null;
    }

    return state;
};

export default combineReducers({ runtime, downloadProgress });
