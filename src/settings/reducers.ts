// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { SettingsActionType } from './actions';
import {
    BooleanSettingId,
    StringSettingId,
    getDefaultBooleanValue,
    getDefaultStringValue,
} from './defaults';

const encoder = new TextEncoder();

const darkMode: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(BooleanSettingId.DarkMode),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === BooleanSettingId.DarkMode) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const showDocs: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(BooleanSettingId.ShowDocs),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === BooleanSettingId.ShowDocs) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const flashCurrentProgram: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(BooleanSettingId.FlashCurrentProgram),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === BooleanSettingId.FlashCurrentProgram) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const hubName: Reducer<string, Action> = (
    state = getDefaultStringValue(StringSettingId.HubName),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidStringChange:
            if (action.id === StringSettingId.HubName) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const isHubNameValid: Reducer<boolean, Action> = (state = true, action) => {
    switch (action.type) {
        case SettingsActionType.DidStringChange:
            if (action.id === StringSettingId.HubName) {
                const encoded = encoder.encode(action.newState);

                // Technically, the max hub name size is determined by each individual
                // firmware file, so we can't check until the firmware has been selected.
                // However all firmware currently has 16 bytes allocated (including zero-
                // termination), so we can hard code the check here to allow notifying the
                // user earlier for better UX.
                return encoded.length < 16;
            }
            return state;
        default:
            return state;
    }
};

export default combineReducers({
    darkMode,
    showDocs,
    flashCurrentProgram,
    hubName,
    isHubNameValid,
});
