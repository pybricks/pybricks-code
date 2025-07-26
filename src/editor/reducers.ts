// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { UUID } from '../fileStorage';
import {
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidOpenFile,
    editorRecentFiles,
} from './actions';
import codeCompletion from './redux/codeCompletion';
import { RecentFileMetadata } from '.';

/** Indicates that the code editor is ready for use. */
const isReady: Reducer<boolean> = (state = false, action) => {
    if (editorDidCreate.matches(action)) {
        return true;
    }

    return state;
};

/**
 * Indicates which file out of {@link openFileUuids} is the currently active file.
 *
 * If {@link activeFileUuid} is not in {@link openFileUuids}, then there is no active file.
 */
const activeFileUuid: Reducer<UUID | null> = (state = null, action) => {
    if (editorDidActivateFile.matches(action)) {
        return action.uuid;
    }

    return state;
};

/** A list of open files in the order they should be displayed to the user. */
const openFileUuids: Reducer<readonly UUID[]> = (state = [], action) => {
    if (editorDidOpenFile.matches(action)) {
        return [...state, action.uuid];
    }

    if (editorDidCloseFile.matches(action)) {
        return state.filter((f) => f !== action.uuid);
    }

    return state;
};

/** A list of recent files in the order they should be displayed to the user. */
const initialStateRecentFiles = JSON.parse(
    localStorage.getItem('editor.recentFiles') || '[]',
) as readonly RecentFileMetadata[];
const recentFiles: Reducer<readonly RecentFileMetadata[]> = (
    state = initialStateRecentFiles,
    action,
) => {
    if (editorRecentFiles.matches(action)) {
        return action.files;
        //return { ...state, recentFiles: action.files };
    }

    return state;
};

export default combineReducers({
    codeCompletion,
    isReady,
    activeFileUuid,
    openFileUuids,
    recentFiles,
});
