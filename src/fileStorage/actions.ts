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

/** Action that indicates that the storage backend failed to initialize. */
export const fileStorageDidFailToInitialize = createAction((error: Error) => ({
    type: 'fileStorage.action.didFailToInitialize',
    error,
}));

/** Action that indicates that an item in the storage was created or changed by us or in another tab. */
export const fileStorageDidChangeItem = createAction((fileName: string) => ({
    type: 'fileStorage.action.didChangeItem',
    fileName,
}));

/** Action that indicates that an item in the storage was removed by us or in another tab. */
export const fileStorageDidRemoveItem = createAction((fileName: string) => ({
    type: 'fileStorage.action.didRemoveItem',
    fileName,
}));

/** Requests to read a file from storage. */
export const fileStorageReadFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.readFile',
    fileName,
}));

/** Response to read file request indicating success. */
export const fileStorageDidReadFile = createAction(
    (fileName: string, fileContents: string) => ({
        type: 'fileStorage.action.didReadFile',
        fileName,
        fileContents,
    }),
);

/** Response to read file request indicating failure. */
export const fileStorageDidFailToReadFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToReadFile',
        fileName,
        error,
    }),
);

/** Requests to write a file to storage. */
export const fileStorageWriteFile = createAction(
    (fileName: string, fileContents: string) => ({
        type: 'fileStorage.action.writeFile',
        fileName,
        fileContents,
    }),
);

/** Response to write file request indicating success. */
export const fileStorageDidWriteFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.didWriteFile',
    fileName,
}));

/** Response to write file request indicating failure. */
export const fileStorageDidFailToWriteFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToWriteFile',
        fileName,
        error,
    }),
);

/**
 * Request to delete a file from storage.
 * @param fileName The name of the file to delete.
 */
export const fileStorageDeleteFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.deleteFile',
    fileName,
}));

/**
 * Indicates that fileStorageDeleteFile(fileName) succeeded.
 * @param fileName The name of the file that was deleted.
 */
export const fileStorageDidDeleteFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.didDeleteFile',
    fileName,
}));

/**
 *  Indicates that fileStorageDeleteFile(fileName) failed.
 * @param fileName The name of the file that should have been deleted.
 * @param error The error.
 */
export const fileStorageDidFailToDeleteFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToDeleteFile',
        fileName,
        error,
    }),
);

/**
 * Requests for a file to be renamed.
 * @param oldName The name of a file that exists in storage.
 * @param newName The new name for the file.
 */
export const fileStorageRenameFile = createAction(
    (oldName: string, newName: string) => ({
        type: 'fileStorage.action.renameFile',
        oldName,
        newName,
    }),
);

/**
 * Indicates that fileStorageRenameFile(oldName, newName) succeeded.
 * @param oldName The previous file name.
 * @param newName The current file name.
 */
export const fileStorageDidRenameFile = createAction(
    (oldName: string, newName: string) => ({
        type: 'fileStorage.action.didRenameFile',
        oldName,
        newName,
    }),
);

/**
 * Indicates that fileStorageRenameFile(oldName, newName) failed.
 * @param oldName The current file name.
 * @param newName The requested new file name.
 * @param error The error.
 */
export const fileStorageDidFailToRenameFile = createAction(
    (oldName: string, newName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToRenameFile',
        oldName,
        newName,
        error,
    }),
);

/**
 * Request to export (download) a file.
 * @param fileName The name of the file.
 */
export const fileStorageExportFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.exportFile',
    fileName,
}));

/**
 * Indicates that fileStorageExportFile(fileName) succeeded.
 * @param fileName The name of the file.
 */
export const fileStorageDidExportFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.didExportFile',
    fileName,
}));

/**
 * Indicates that fileStorageExportFile(fileName) failed.
 * @param fileName The name of the file.
 * @param error The error that was raised.
 */
export const fileStorageDidFailToExportFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToExportFile',
        fileName,
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
