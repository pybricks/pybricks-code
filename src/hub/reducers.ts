// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import * as semver from 'semver';
import {
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDisconnectPybricks,
} from '../ble/actions';
import { bleDIServiceDidReceiveSoftwareRevision } from '../ble-device-info-service/actions';
import { HubType } from '../ble-lwp3-service/protocol';
import {
    blePybricksServiceDidNotReceiveHubCapabilities,
    blePybricksServiceDidReceiveHubCapabilities,
    didReceiveStatusReport,
} from '../ble-pybricks-service/actions';
import {
    FileFormat,
    HubCapabilityFlag,
    Status,
    statusToFlag,
} from '../ble-pybricks-service/protocol';
import { pythonVersionToSemver } from '../utils/version';
import {
    didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
    hubDidFailToStartRepl,
    hubDidFailToStopUserProgram,
    hubDidStartRepl,
    hubDidStopUserProgram,
    hubStartRepl,
    hubStopUserProgram,
} from './actions';

/**
 * Describes the state of the MicroPython runtime on the hub.
 */
export enum HubRuntimeState {
    /** The hub is not connected. */
    Disconnected = 'hub.runtime.disconnected',
    /** The hub is connected but the state is not known yet. */
    Unknown = 'hub.runtime.unknown',
    /** The runtime is idle waiting for command after soft reboot. */
    Idle = 'hub.runtime.idle',
    /** A user program is being copied to the hub. */
    Loading = 'hub.runtime.loading',
    /** A user program is running. */
    Running = 'hub.runtime.running',
    /** Busy starting the REPL. */
    StartingRepl = 'hub.runtime.startingRepl',
    /** Busy stopping user program. */
    StoppingUserProgram = 'hub.runtime.stoppingUserProgram',
}

const runtime: Reducer<HubRuntimeState> = (
    state = HubRuntimeState.Disconnected,
    action,
) => {
    // Disconnect overrides all other states. If the hub is disconnected, we
    // can't possibly be in any other state until we get a connect event.
    if (
        state === HubRuntimeState.Disconnected &&
        !bleDidConnectPybricks.matches(action)
    ) {
        return state;
    }

    if (bleDidConnectPybricks.matches(action)) {
        return HubRuntimeState.Unknown;
    }

    if (bleDisconnectPybricks.matches(action)) {
        // disconnecting
        return HubRuntimeState.Unknown;
    }

    if (bleDidDisconnectPybricks.matches(action)) {
        return HubRuntimeState.Disconnected;
    }

    if (didStartDownload.matches(action)) {
        return HubRuntimeState.Loading;
    }

    if (didFinishDownload.matches(action)) {
        // state is unknown until we receive a status event
        return HubRuntimeState.Unknown;
    }

    if (didFailToFinishDownload.matches(action)) {
        return HubRuntimeState.Idle;
    }

    if (didReceiveStatusReport.matches(action)) {
        // The loading state is determined solely by the IDE, so we can't
        // let the hub status interfere with it.
        if (
            state === HubRuntimeState.Loading ||
            state === HubRuntimeState.StartingRepl ||
            state === HubRuntimeState.StoppingUserProgram
        ) {
            return state;
        }

        if (action.statusFlags & statusToFlag(Status.UserProgramRunning)) {
            return HubRuntimeState.Running;
        }

        return HubRuntimeState.Idle;
    }

    if (hubStartRepl.matches(action)) {
        return HubRuntimeState.StartingRepl;
    }

    if (hubDidStartRepl.matches(action)) {
        // state is unknown until we receive a status event
        return HubRuntimeState.Unknown;
    }

    if (hubDidFailToStartRepl.matches(action)) {
        // failed to communicate, so state is unknown
        return HubRuntimeState.Unknown;
    }

    if (hubStopUserProgram.matches(action)) {
        return HubRuntimeState.StoppingUserProgram;
    }

    if (hubDidStopUserProgram.matches(action)) {
        // state is unknown until we receive a status event
        return HubRuntimeState.Unknown;
    }

    if (hubDidFailToStopUserProgram.matches(action)) {
        // failed to communicate, so state is unknown
        return HubRuntimeState.Unknown;
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
        return null;
    }

    if (didFailToFinishDownload.matches(action)) {
        return null;
    }

    return state;
};

/**
 * The maximum number of bytes that can be written to a BLE characteristic value
 * without triggering a long write.
 *
 * This value is only valid when connected to a hub and {@link useLegacyDownload}
 * is false.
 */
const maxBleWriteSize: Reducer<number> = (state = 0, action) => {
    if (blePybricksServiceDidReceiveHubCapabilities.matches(action)) {
        return action.maxWriteSize;
    }

    return state;
};

/**
 * The maximum number of bytes for the user program size.
 *
 * This value is only valid when connected to a hub and {@link useLegacyDownload}
 * is false.
 */
const maxUserProgramSize: Reducer<number> = (state = 0, action) => {
    if (blePybricksServiceDidReceiveHubCapabilities.matches(action)) {
        return action.maxUserProgramSize;
    }

    return state;
};

/**
 * Indicates if the connected hub supports a REPL.
 */
const hasRepl: Reducer<boolean> = (state = false, action) => {
    if (blePybricksServiceDidReceiveHubCapabilities.matches(action)) {
        return Boolean(action.flags & HubCapabilityFlag.HasRepl);
    }

    // for older firmware without hub capabilities characteristic, infer
    // REPL support from hub type (move hub is only one without REPL).
    if (blePybricksServiceDidNotReceiveHubCapabilities.matches(action)) {
        return action.pnpId.productId !== HubType.MoveHub;
    }

    return state;
};

/**
 * The preferred file format of the connected hub or null if the hub does not
 * support any file formats that Pybricks Code supports.
 */
const preferredFileFormat: Reducer<FileFormat | null> = (state = null, action) => {
    if (blePybricksServiceDidReceiveHubCapabilities.matches(action)) {
        if (action.flags & HubCapabilityFlag.UserProgramMultiMpy6) {
            return FileFormat.MultiMpy6;
        }

        // no supported format
        return null;
    }

    if (blePybricksServiceDidNotReceiveHubCapabilities.matches(action)) {
        // HACK: there is not a good way to get the supported MPY ABI version
        // from a running hub, so we use heuristics on the firmware version.
        if (semver.lte(pythonVersionToSemver(action.firmwareVersion), '3.2.0-beta.2')) {
            return FileFormat.Mpy5;
        }

        return FileFormat.Mpy6;
    }

    return state;
};

/**
 * When true, use NUS for download and run instead of Pybricks control characteristic.
 */
const useLegacyDownload: Reducer<boolean> = (state = false, action) => {
    if (blePybricksServiceDidReceiveHubCapabilities.matches(action)) {
        return false;
    }

    if (blePybricksServiceDidNotReceiveHubCapabilities.matches(action)) {
        return true;
    }

    return state;
};

/**
 * When true, use NUS for stdio instead of Pybricks control characteristic.
 */
const useLegacyStdio: Reducer<boolean> = (state = false, action) => {
    if (bleDIServiceDidReceiveSoftwareRevision.matches(action)) {
        // Behavior changed starting with Pybricks Profile v1.3.0.
        return !semver.satisfies(action.version, '^1.3.0');
    }

    return state;
};

export default combineReducers({
    runtime,
    downloadProgress,
    maxBleWriteSize,
    maxUserProgramSize,
    hasRepl,
    preferredFileFormat,
    useLegacyDownload,
    useLegacyStdio,
});
