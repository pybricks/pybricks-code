// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/** Type to avoid mixing UUID with regular string. */
export type UUID = string & { _uuidBrand: undefined };

/**
 * Database metadata table data type.
 *
 * IMPORTANT: if this type is changed, we need to modify the database schema to match
 */
export type FileMetadata = Readonly<{
    /** A globally unique identifier that serves a a file handle. */
    uuid: UUID;
    /** The path of the file in storage. */
    path: string;
    /** The SHA256 hash of the file contents. */
    sha256: string;
}>;

/**
 * Action that indicates that the storage backend is ready to use.
 * @param files List of all files currently in storage.
 */
export const fileStorageDidInitialize = createAction(
    (files: readonly FileMetadata[]) => ({
        type: 'fileStorage.action.didInitialize',
        files,
    }),
);

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
 * @param file The file metadata.
 */
export const fileStorageDidAddItem = createAction((file: FileMetadata) => ({
    type: 'fileStorage.action.didAddItem',
    file,
}));

/**
 * Action that indicates that an item in the storage was  changed by us or in another tab.
 * @param file The old file metadata.
 * @param file The file metadata.
 */
export const fileStorageDidChangeItem = createAction(
    (oldFile: FileMetadata, file: FileMetadata) => ({
        type: 'fileStorage.action.didChangeItem',
        oldFile,
        file,
    }),
);

/**
 * Action that indicates that an item in the storage was removed by us or in another tab.
 * @param file The file metadata.
 */
export const fileStorageDidRemoveItem = createAction((file: FileMetadata) => ({
    type: 'fileStorage.action.didRemoveItem',
    file,
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
export const fileStorageDidOpenFile = createAction((path: string, id: UUID) => ({
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
export const fileStorageReadFile = createAction((id: UUID) => ({
    type: 'fileStorage.action.readFile',
    id,
}));

/**
 * Response to read file request indicating success.
 * @param id The file handle UUID.
 * @param contents The contents of the file.
 */
export const fileStorageDidReadFile = createAction((id: UUID, contents: string) => ({
    type: 'fileStorage.action.didReadFile',
    id,
    contents,
}));

/**
 * Response to read file request indicating failure.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToReadFile = createAction((id: UUID, error: Error) => ({
    type: 'fileStorage.action.didFailToReadFile',
    id,
    error,
}));

/**
 * Requests to write a file to storage.
 * @param id The file handle UUID.
 * @param contents The contents of the file.
 */
export const fileStorageWriteFile = createAction((id: UUID, contents: string) => ({
    type: 'fileStorage.action.writeFile',
    id,
    contents,
}));

/**
 * Response to write file request indicating success.
 * @param id The file handle UUID.
 */
export const fileStorageDidWriteFile = createAction((id: UUID) => ({
    type: 'fileStorage.action.didWriteFile',
    id,
}));

/**
 * Response to write file request indicating failure.
 * @param id The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToWriteFile = createAction((id: UUID, error: Error) => ({
    type: 'fileStorage.action.didFailToWriteFile',
    id,
    error,
}));

/**
 * Request to delete a file from storage.
 * @param id The file handle UUID.
 */
export const fileStorageDeleteFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.deleteFile',
    fileName,
}));

/**
 * Indicates that {@link fileStorageDeleteFile} succeeded.
 * @param fileName The file handle UUID.
 */
export const fileStorageDidDeleteFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.didDeleteFile',
    fileName,
}));

/**
 *  Indicates that {@link fileStorageDeleteFile} failed.
 * @param fileName The file handle UUID.
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
 * @param fileName The file handle UUID.
 * @param newName The new name for the file.
 */
export const fileStorageRenameFile = createAction(
    (fileName: string, newName: string) => ({
        type: 'fileStorage.action.renameFile',
        fileName,
        newName,
    }),
);

/**
 * Indicates that fileStorageRenameFile(oldName, newName) succeeded.
 * @param fileName The file handle UUID.
 */
export const fileStorageDidRenameFile = createAction((fileName: string) => ({
    type: 'fileStorage.action.didRenameFile',
    fileName,
}));

/**
 * Indicates that fileStorageRenameFile(oldName, newName) failed.
 * @param fileName The file handle UUID.
 * @param error The error.
 */
export const fileStorageDidFailToRenameFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'fileStorage.action.didFailToRenameFile',
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
