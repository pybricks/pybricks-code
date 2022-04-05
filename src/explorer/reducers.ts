// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    FileMetadata,
    fileStorageDidAddItem,
    fileStorageDidChangeItem,
    fileStorageDidInitialize,
    fileStorageDidRemoveItem,
} from '../fileStorage/actions';

import renameFileDialog from './renameFileDialog/reducers';

export type ExplorerFileInfo = Readonly<{
    /** A unique identifier for this file (not the path, which can change). */
    id: string;
    /** The file name (including extension - without directory). */
    name: string;
}>;

function metadataToInfo(file: FileMetadata): ExplorerFileInfo {
    return { id: file.uuid, name: file.path };
}

const files: Reducer<readonly ExplorerFileInfo[]> = (state = [], action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return action.files.map(metadataToInfo);
    }

    if (fileStorageDidAddItem.matches(action)) {
        return [...state, metadataToInfo(action.file)];
    }

    if (fileStorageDidChangeItem.matches(action)) {
        // We only care about UUID and the path. UUID can't change so if the
        // path didn't change, there is nothing to do.
        if (action.oldFile.path === action.file.path) {
            return state;
        }

        return state.map((f) =>
            f.id === action.file.uuid ? metadataToInfo(action.file) : f,
        );
    }

    if (fileStorageDidRemoveItem.matches(action)) {
        return state.filter((value) => value.id !== action.file.uuid);
    }

    return state;
};

export default combineReducers({ files, renameFileDialog });
