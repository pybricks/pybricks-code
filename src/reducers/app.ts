// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: reducers/app.ts
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { AppActionType } from '../actions/app';

const showDocs: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.ToggleDocs:
            return !state;
        default:
            return state;
    }
};

export interface AppState {
    readonly showDocs: boolean;
}

export default combineReducers({ showDocs });
