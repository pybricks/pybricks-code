// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { FlashFirmwareActionType } from '../actions/flash-firmware';

export interface FirmwareState {
    /** The firmware is being erased/flashed right now. */
    flashing: boolean;
    /** The current progress (0 to 1) or null for unknown (e.g erasing) */
    progress: number | null;
}

const flashing: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case FlashFirmwareActionType.DidStart:
            return true;
        case FlashFirmwareActionType.DidFinish:
        case FlashFirmwareActionType.DidFailToFinish:
            return false;
        default:
            return state;
    }
};

const progress: Reducer<number | null, Action> = (state = null, action) => {
    switch (action.type) {
        case FlashFirmwareActionType.DidStart:
            return null;
        case FlashFirmwareActionType.DidProgress:
            return action.value;
        default:
            return state;
    }
};

export default combineReducers({ flashing, progress });
