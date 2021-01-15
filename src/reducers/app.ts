// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: reducers/app.ts
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { AppActionType } from '../actions/app';

export interface AppState {
    readonly showSettings: boolean;
    readonly showAboutDialog: boolean;
}

const showSettings: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.OpenSettings:
            return true;
        case AppActionType.CloseSettings:
            return false;
        default:
            return state;
    }
};

const showAboutDialog: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.OpenAboutDialog:
            return true;
        case AppActionType.CloseAboutDialog:
            return false;
        default:
            return state;
    }
};

export default combineReducers({ showSettings, showAboutDialog });
