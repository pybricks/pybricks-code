// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';
/**
 * Request to archive (download) all files in the store.
 */
export const explorerArchiveAllFiles = createAction(() => ({
    type: 'explorer.action.archiveAllFiles',
}));

/**
 * Indicates that {@link explorerArchiveAllFiles} succeeded.
 */
export const explorerDidArchiveAllFiles = createAction(() => ({
    type: 'explorer.action.didArchiveAllFiles',
}));

/**
 * Indicates that {@link explorerArchiveAllFiles} failed.
 * @param error The error that was raised.
 */
export const explorerDidFailToArchiveAllFiles = createAction((error: Error) => ({
    type: 'explorer.action.didFailToArchiveAllFiles',
    error,
}));

/**
 * Action that requests to import (upload) files into the app.
 */
export const explorerImportFiles = createAction(() => ({
    type: 'explorer.action.importFiles',
}));

/**
 * Action that indicates that explorerImportFiles() succeeded.
 */
export const explorerDidImportFiles = createAction(() => ({
    type: 'explorer.action.didImportFiles',
}));

/**
 * Action that indicates that explorerImportFiles() failed.
 * @param error The error.
 */
export const explorerDidFailToImportFiles = createAction((error: Error) => ({
    type: 'explorer.action.didFailToImportFiles',
    error,
}));

/**
 * Action that requests to create a new file.
 */
export const explorerCreateNewFile = createAction(() => ({
    type: 'explorer.action.createNewFile',
}));

/**
 * Action that indicates that {@link explorerCreateNewFile} succeeded.
 */
export const explorerDidCreateNewFile = createAction(() => ({
    type: 'explorer.action.didCreateNewFile',
}));

/**
 * Action that indicates that {@link explorerCreateNewFile} failed.
 * @param error The error.
 */
export const explorerDidFailToCreateNewFile = createAction((error: Error) => ({
    type: 'explorer.action.didFailToCreateNewFile',
    error,
}));

/**
 * Request to activate a file (open or bring to foreground if already open).
 * @param fileName The file name.
 */
export const explorerActivateFile = createAction((fileName: string) => ({
    type: 'explorer.action.activateFile',
    fileName,
}));

/**
 * Indicates that {@link explorerActivateFile} succeeded.
 * @param fileName The file name.
 */
export const explorerDidActivateFile = createAction((fileName: string) => ({
    type: 'explorer.action.didActivateFile',
    fileName,
}));

/**
 * Indicates that {@link explorerActivateFile} failed.
 * @param fileName The file name.
 * @param error The error that was raised.
 */
export const explorerDidFailToActivateFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'explorer.action.didFailToActivateFile',
        fileName,
        error,
    }),
);

/**
 * Request to export (download) a file.
 * @param fileName The file name.
 */
export const explorerExportFile = createAction((fileName: string) => ({
    type: 'explorer.action.exportFile',
    fileName,
}));

/**
 * Indicates that {@link explorerExportFile} succeeded.
 * @param fileName The file name.
 */
export const explorerDidExportFile = createAction((fileName: string) => ({
    type: 'explorer.action.didExportFile',
    fileName,
}));

/**
 * Indicates that {@link explorerExportFile} failed.
 * @param fileName The file name.
 * @param error The error that was raised.
 */
export const explorerDidFailToExportFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'explorer.action.didFailToExportFile',
        fileName,
        error,
    }),
);

/**
 * Action that requests to delete a file.
 * @param fileName The file name.
 */
export const explorerDeleteFile = createAction((fileName: string) => ({
    type: 'explorer.action.deleteFile',
    fileName,
}));

/**
 * Action that indicates that {@link explorerDeleteFile} succeeded.
 * @param fileName The file name.
 */
export const explorerDidDeleteFile = createAction((fileName: string) => ({
    type: 'explorer.action.didDeleteFile',
    fileName,
}));

/**
 * Action that indicates that {@link explorerDeleteFile} failed.
 * @param fileName The file name.
 */
export const explorerDidFailToDeleteFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'explorer.action.didFailToDeleteFile',
        fileName,
        error,
    }),
);
