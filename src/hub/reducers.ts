// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { BlePybricksServiceEventActionType } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { BleDeviceActionType } from '../ble/actions';
import { HubActionType } from './actions';

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

const runtime: Reducer<HubRuntimeState, Action> = (
    state = HubRuntimeState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BleDeviceActionType.DidConnect:
            return HubRuntimeState.Unknown;
        case BleDeviceActionType.DidDisconnect:
            return HubRuntimeState.Disconnected;
        case HubActionType.DidStartDownload:
            // disconnected overrides download
            if (state === HubRuntimeState.Disconnected) {
                return state;
            }
            return HubRuntimeState.Loading;
        case HubActionType.DidFinishDownload:
            // disconnected overrides download
            if (state === HubRuntimeState.Disconnected) {
                return state;
            }
            return HubRuntimeState.Loaded;
        case HubActionType.DidFailToFinishDownload:
            // disconnected overrides download
            if (state === HubRuntimeState.Disconnected) {
                return state;
            }
            return HubRuntimeState.Idle;
        case BlePybricksServiceEventActionType.StatusReport:
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
        default:
            return state;
    }
};

const downloadProgress: Reducer<number | null, Action> = (state = null, action) => {
    switch (action.type) {
        case HubActionType.DidStartDownload:
            return 0;
        case HubActionType.DidProgressDownload:
            return action.progress;
        case HubActionType.DidFinishDownload:
            return 1;
        case HubActionType.DidFailToFinishDownload:
            return null;
        default:
            return state;
    }
};

export default combineReducers({ runtime, downloadProgress });
