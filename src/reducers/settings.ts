// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { SettingsActionType } from '../actions/settings';

export interface SettingsState {
    readonly darkMode: boolean;
    readonly showDocs: boolean;
}

const darkMode: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case SettingsActionType.ToggleDarkMode:
            return !state;
        default:
            return state;
    }
};

const showDocs: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case SettingsActionType.ToggleDocs:
            return !state;
        default:
            return state;
    }
};

export default combineReducers({ darkMode, showDocs });
