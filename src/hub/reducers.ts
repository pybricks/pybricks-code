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
        case BleDeviceActionType.DidDisconnect:
            return HubRuntimeState.Disconnected;
        case HubActionType.DidStartDownload:
            return HubRuntimeState.Loading;
        case HubActionType.DidFinishDownload:
            return HubRuntimeState.Loaded;
        case HubActionType.DidFailToFinishDownload:
            return HubRuntimeState.Idle;
        case BlePybricksServiceEventActionType.StatusReport:
            // The loading state is determined solely by the IDE, so we can't
            // let the hub status interfere with it.
            if (state !== HubRuntimeState.Loading) {
                if (action.statusFlags & statusToFlag(Status.UserProgramRunning)) {
                    return HubRuntimeState.Running;
                }
                return HubRuntimeState.Idle;
            }
            return state;
        default:
            return state;
    }
};

export default combineReducers({ runtime });
