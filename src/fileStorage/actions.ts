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
