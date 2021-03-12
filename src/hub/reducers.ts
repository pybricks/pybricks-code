// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { BlePybricksServiceEventActionType } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { BleDeviceActionType } from '../ble/actions';
import { HubMessageActionType, HubRuntimeStatusType } from './actions';

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
    /**
     * The runtime encountered an error.
     */
    Error = 'hub.runtime.error',
}

const runtime: Reducer<HubRuntimeState, Action> = (
    state = HubRuntimeState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BleDeviceActionType.DidDisconnect:
            return HubRuntimeState.Disconnected;
        case HubMessageActionType.RuntimeStatus:
            switch (action.newStatus) {
                case HubRuntimeStatusType.Idle:
                    return HubRuntimeState.Idle;
                case HubRuntimeStatusType.Loading:
                    return HubRuntimeState.Loading;
                case HubRuntimeStatusType.Loaded:
                    return HubRuntimeState.Loaded;
                case HubRuntimeStatusType.Running:
                    return HubRuntimeState.Running;
                case HubRuntimeStatusType.Error:
                    return HubRuntimeState.Error;
                default:
                    console.error(`bad action/state: ${action.newStatus}`);
                    return state;
            }
        case BlePybricksServiceEventActionType.StatusReport:
            return action.statusFlags & statusToFlag(Status.UserProgramRunning)
                ? HubRuntimeState.Running
                : HubRuntimeState.Idle;
        default:
            return state;
    }
};

export default combineReducers({ runtime });
