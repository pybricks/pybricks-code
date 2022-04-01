// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    fileStorageDidAddItem,
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

const fileNames: Reducer<ReadonlyArray<string>> = (state = [], action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return [...action.fileNames];
    }

    if (fileStorageDidAddItem.matches(action)) {
        return [...state, action.id];
    }

    if (fileStorageDidChangeItem.matches(action)) {
        return state;
    }

    if (fileStorageDidRemoveItem.matches(action)) {
        return [...state].filter((value) => value !== action.id);
    }

    return state;
};

export default combineReducers({ isInitialized, fileNames });
