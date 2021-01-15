// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { SettingsActionType } from '../actions/settings';
import { SettingId, getDefaultBooleanValue } from '../settings';

export interface SettingsState {
    readonly darkMode: boolean;
    readonly showDocs: boolean;
    readonly flashCurrentProgram: boolean;
}

const darkMode: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(SettingId.DarkMode),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === SettingId.DarkMode) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const showDocs: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(SettingId.ShowDocs),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === SettingId.ShowDocs) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

const flashCurrentProgram: Reducer<boolean, Action> = (
    state = getDefaultBooleanValue(SettingId.FlashCurrentProgram),
    action,
) => {
    switch (action.type) {
        case SettingsActionType.DidBooleanChange:
            if (action.id === SettingId.FlashCurrentProgram) {
                return action.newState;
            }
            return state;
        default:
            return state;
    }
};

export default combineReducers({ darkMode, showDocs, flashCurrentProgram });
