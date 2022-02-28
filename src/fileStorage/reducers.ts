// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    fileStorageDidChangeItem,
    fileStorageDidInitialize,
    fileStorageDidRemoveItem,
} from './actions';

const isInitialized: Reducer<boolean> = (state = false, action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return true;
    }

    return state;
};

const fileNames: Reducer<Set<string>> = (state = new Set(), action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return new Set(action.fileNames);
    }

    if (fileStorageDidChangeItem.matches(action)) {
        return new Set([...state, action.fileName]);
    }

    if (fileStorageDidRemoveItem.matches(action)) {
        return new Set([...state].filter((value) => value !== action.fileName));
    }

    return state;
};

export default combineReducers({ isInitialized, fileNames });
