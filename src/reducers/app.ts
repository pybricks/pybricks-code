// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: reducers/app.ts
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { AppActionType } from '../actions/app';

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

export interface AppState {
    readonly showSettings: boolean;
}

export default combineReducers({ showSettings });
