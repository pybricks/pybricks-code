// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';

/** Supported file extensions. */
type SupportedFileExtension = typeof pythonFileExtension;

/** Supported hub types. */
export enum Hub {
    /** BOOST Move hub */
    Move = 'movehub',
    /** City hub */
    City = 'cityhub',
    /** Technic hub */
    Technic = 'technichub',
    /** MINDSTORMS Robot Inventor hub */
    Inventor = 'inventorhub',
    /** SPIKE Prime hub */
    Prime = 'primehub',
    /** SPIKE Essential hub */
    Essential = 'essentialhub',
}

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
 * @param fileName The requested new file name (without file extension).
 * @param fileExtension The file extension (including leading ".").
 * @param hub The type of hub this file is for.
 */
export const explorerCreateNewFile = createAction(
    (fileName: string, fileExtension: SupportedFileExtension, hub: Hub) => ({
        type: 'explorer.action.createNewFile',
        fileName,
        fileExtension,
        hub,
    }),
);

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
 * Action that requests to rename a file.
 * @param fileName The file name.
 */
export const explorerRenameFile = createAction((fileName: string) => ({
    type: 'explorer.action.renameFile',
    fileName,
}));

/**
 * Request to export (download) a file.
 * @param fileName The file name.
 */
export const explorerExportFile = createAction((fileName: string) => ({
    type: 'explorer.action.exportFile',
    fileName,
}));

/**
 * Indicates that explorerExportFile(fileName) succeeded.
 * @param fileName The file name.
 */
export const explorerDidExportFile = createAction((fileName: string) => ({
    type: 'explorer.action.didExportFile',
    fileName,
}));

/**
 * Indicates that explorerExportFile(fileName) failed.
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
 * Action that indicates that {@link explorerRenameFile} succeeded.
 */
export const explorerDidRenameFile = createAction(() => ({
    type: 'explorer.action.didRenameFile',
}));

/**
 * Action that indicates that {@link explorerRenameFile} failed.
 */
export const explorerDidFailToRenameFile = createAction(() => ({
    type: 'explorer.action.didFailToRenameFile',
}));

/**
 * Action that requests to delete a file.
 * @param fileName The file name.
 */
export const explorerDeleteFile = createAction((fileName: string) => ({
    type: 'explorer.action.deleteFile',
    fileName,
}));
