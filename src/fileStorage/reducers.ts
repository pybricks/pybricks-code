// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { FileStorageActionType } from './actions';

const isInitialized: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case FileStorageActionType.DidInitialize:
            return true;
        default:
            return state;
    }
};

const fileNames: Reducer<Set<string>, Action> = (state = new Set(), action) => {
    switch (action.type) {
        case FileStorageActionType.DidChangeItem:
            return new Set([...state, action.fileName]);
        case FileStorageActionType.DidRemoveItem:
            return new Set([...state].filter((value) => value !== action.fileName));
        default:
            return state;
    }
};

export default combineReducers({ isInitialized, fileNames });
