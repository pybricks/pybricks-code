// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/**
 * Action that indicates that the storage backend is ready to use.
 * @param fileNames List of all files currently in storage.
 */
export const fileStorageDidInitialize = createAction((fileNames: string[]) => ({
    type: 'fileStorage.action.didInitialize',
    fileNames,
}));

/**
 * Action that indicates that the storage backend failed to initialize.
 * @param error The error.
 */
export const fileStorageDidFailToInitialize = createAction((error: Error) => ({
    type: 'fileStorage.action.didFailToInitialize',
    error,
}));

/**
 * Action that indicates that an item in the storage was created by us or in another tab.
 * @param id The file handle UUID.
 */
export const fileStorageDidAddItem = createAction((id: string) => ({
    type: 'fileStorage.action.didAddItem',
    id,
}));

/**
 * Action that indicates that an item in the storage was  changed by us or in another tab.
 * @param id The file handle UUID.
 */
export const fileStorageDidChangeItem = createAction((id: string) => ({
    type: 'fileStorage.action.didChangeItem',
    id,
}));

/**
 * Action that indicates that an item in the storage was removed by us or in another tab.
 * @param id The file handle UUID.
 */
export const fileStorageDidRemoveItem = createAction((id: string) => ({
    type: 'fileStorage.action.didRemoveItem',
    id,
}));

/**
 * Action that requests to open a file in storage.
 * @param path The file path.
 */
export const fileStorageOpenFile = createAction((path: string) => ({
    type: 'fileStorage.action.Open',
    path,
}));

/**
 * Action that indicates that {@link fileStorageOpenFile} succeeded.
 * @param path The file path.
 * @param id The file handle UUID.
 */
export const fileStorageDidOpenFile = createAction((path: string, id: string) => ({
    type: 'fileStorage.action.DidOpen',
    path,
    id,
}));

/**
 * Action that indicates that {@link fileStorageOpenFile} failed.
 * @param path The file path.
 * @param error The error.
 */
export const fileStorageDidFailToOpenFile = createAction(
    (path: string, error: Error) => ({
        type: 'fileStorage.action.DidFailToOpen',
        path,
        error,
    }),
);
/**
 * Requests to read a file from storage.
 * @param id The file handle UUID.
 */
export const fileStorageReadFile = createAction((id: string) => ({
    type: 'fileStorage.action.readFile',
    id,
}));

/**
 * Response to read file request indicating success.
 * @param id The file handle UUID.
 * @param contents The contents of the file.
 */
export const fileStorageDidReadFile = createAction((id: string, contents: string) => ({
    type: 'fileStorage.action.didReadFile',
    id,
    contents,
}));

/**
 * Response to read file request indicating failure.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToReadFile = createAction(
    (id: string, error: Error) => ({
        type: 'fileStorage.action.didFailToReadFile',
        id,
        error,
    }),
);

/**
 * Requests to write a file to storage.
 * @param id The file handle UUID.
 * @param contents The contents of the file.
 */
export const fileStorageWriteFile = createAction((id: string, contents: string) => ({
    type: 'fileStorage.action.writeFile',
    id,
    contents,
}));

/**
 * Response to write file request indicating success.
 * @param id The file handle UUID.
 */
export const fileStorageDidWriteFile = createAction((id: string) => ({
    type: 'fileStorage.action.didWriteFile',
    id,
}));

/**
 * Response to write file request indicating failure.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToWriteFile = createAction(
    (id: string, error: Error) => ({
        type: 'fileStorage.action.didFailToWriteFile',
        id,
        error,
    }),
);

/**
 * Request to delete a file from storage.
 * @param id The file handle UUID.
 */
export const fileStorageDeleteFile = createAction((id: string) => ({
    type: 'fileStorage.action.deleteFile',
    id,
}));

/**
 * Indicates that {@link fileStorageDeleteFile} succeeded.
 * @param id The file handle UUID.
 */
export const fileStorageDidDeleteFile = createAction((id: string) => ({
    type: 'fileStorage.action.didDeleteFile',
    id,
}));

/**
 *  Indicates that {@link fileStorageDeleteFile} failed.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToDeleteFile = createAction(
    (id: string, error: Error) => ({
        type: 'fileStorage.action.didFailToDeleteFile',
        id,
        error,
    }),
);

/**
 * Requests for a file to be renamed.
 * @param id The file handle UUID.
 * @param newName The new name for the file.
 */
export const fileStorageRenameFile = createAction((id: string, newName: string) => ({
    type: 'fileStorage.action.renameFile',
    id,
    newName,
}));

/**
 * Indicates that fileStorageRenameFile(oldName, newName) succeeded.
 * @param id The file handle UUID.
 */
export const fileStorageDidRenameFile = createAction((id: string) => ({
    type: 'fileStorage.action.didRenameFile',
    id,
}));

/**
 * Indicates that fileStorageRenameFile(oldName, newName) failed.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToRenameFile = createAction(
    (id: string, error: Error) => ({
        type: 'fileStorage.action.didFailToRenameFile',
        id,
        error,
    }),
);

/**
 * Request to export (download) a file.
 * @param id The file handle UUID.
 */
export const fileStorageExportFile = createAction((id: string) => ({
    type: 'fileStorage.action.exportFile',
    id,
}));

/**
 * Indicates that fileStorageExportFile(fileName) succeeded.
 * @param id The file handle UUID.
 */
export const fileStorageDidExportFile = createAction((id: string) => ({
    type: 'fileStorage.action.didExportFile',
    id,
}));

/**
 * Indicates that fileStorageExportFile(fileName) failed.
 * @param id The file handle UUID.
 * @param error The error that was raised.
 */
export const fileStorageDidFailToExportFile = createAction(
    (id: string, error: Error) => ({
        type: 'fileStorage.action.didFailToExportFile',
        id,
        error,
    }),
);

/**
 * Request to archive (download) all files in the store.
 */
export const fileStorageArchiveAllFiles = createAction(() => ({
    type: 'fileStorage.action.archiveAllFiles',
}));

/**
 * Indicates that fileStorageArchiveAllFiles() succeeded.
 */
export const fileStorageDidArchiveAllFiles = createAction(() => ({
    type: 'fileStorage.action.didArchiveAllFiles',
}));

/**
 * Indicates that fileStorageArchiveAllFiles() failed.
 * @param error The error that was raised.
 */
export const fileStorageDidFailToArchiveAllFiles = createAction((error: Error) => ({
    type: 'fileStorage.action.didFailToArchiveAllFiles',
    error,
}));
