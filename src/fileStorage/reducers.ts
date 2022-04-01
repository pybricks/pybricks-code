// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    FileMetadata,
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

const files: Reducer<readonly FileMetadata[]> = (state = [], action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return [...action.files];
    }

    if (fileStorageDidAddItem.matches(action)) {
        return [...state, action.file];
    }

    if (fileStorageDidChangeItem.matches(action)) {
        return [...state].map((f) => (f.uuid === action.file.uuid ? action.file : f));
    }

    if (fileStorageDidRemoveItem.matches(action)) {
        return [...state].filter((value) => value.uuid !== action.file.uuid);
    }

    return state;
};

export default combineReducers({ isInitialized, files });
