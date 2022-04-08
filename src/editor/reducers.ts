// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidOpenFile,
} from './actions';

/** Indicates that the code editor is ready for use. */
const isReady: Reducer<boolean> = (state = false, action) => {
    if (editorDidCreate.matches(action)) {
        return true;
    }

    return state;
};

/**
 * Indicates which file out of {@link openFiles} is the currently active file.
 *
 * If {@link activeFile} is not in {@link openFiles}, then there is no active file.
 */
const activeFile: Reducer<string> = (state = '', action) => {
    if (editorDidActivateFile.matches(action)) {
        return action.fileName;
    }

    return state;
};

/** A list of open files in the order they should be displayed to the user. */
const openFiles: Reducer<readonly string[]> = (state = [], action) => {
    if (editorDidOpenFile.matches(action)) {
        return [...state, action.fileName];
    }

    if (editorDidCloseFile.matches(action)) {
        return state.filter((f) => f !== action.fileName);
    }

    return state;
};

export default combineReducers({ isReady, activeFile, openFiles });
