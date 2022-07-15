// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import * as semver from 'semver';
import { bleDIServiceDidReceiveFirmwareRevision } from '../ble-device-info-service/actions';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { bleDidConnectPybricks, bleDidDisconnectPybricks } from '../ble/actions';
import { pythonVersionToSemver } from '../utils/version';
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
    if (bleDidConnectPybricks.matches(action)) {
        return HubRuntimeState.Unknown;
    }

    if (bleDidDisconnectPybricks.matches(action)) {
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

const mpyAbiVersion: Reducer<number> = (state = 6, action) => {
    if (bleDIServiceDidReceiveFirmwareRevision.matches(action)) {
        // HACK: there is not a good way to get the supported MPY ABI version
        // from a running hub, so we use heuristics on the firmware version.
        if (semver.satisfies(pythonVersionToSemver(action.version), '>=3.2.0-beta.2')) {
            return 6;
        }

        return 5;
    }

    return state;
};

export default combineReducers({ runtime, downloadProgress, mpyAbiVersion });
