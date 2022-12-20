// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import * as semver from 'semver';
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
            return FileFormat.Mpy6;
        }

        return FileFormat.Mpy5;
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

export default combineReducers({
    runtime,
    downloadProgress,
    maxBleWriteSize,
    maxUserProgramSize,
    hasRepl,
    preferredFileFormat,
    useLegacyDownload,
});
