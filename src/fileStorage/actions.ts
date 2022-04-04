// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/** File open modes. */
export type FileOpenMode = 'r' | 'w';

/** Type to avoid mixing up file descriptor with number. */
export type FD = number & { _fdBrand: undefined };

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
 * @param mode 'r' to open for reading or 'w' to open for writing.
 */
export const fileStorageOpen = createAction((path: string, mode: FileOpenMode) => ({
    type: 'fileStorage.action.Open',
    path,
    mode,
}));

/**
 * Action that indicates that {@link fileStorageOpen} succeeded.
 * @param path The file path.
 * @param fd The file descriptor.
 */
export const fileStorageDidOpen = createAction((path: string, fd: FD) => ({
    type: 'fileStorage.action.DidOpen',
    path,
    fd,
}));

/**
 * Action that indicates that {@link fileStorageOpen} failed.
 * @param path The file path.
 * @param error The error.
 */
export const fileStorageDidFailToOpen = createAction((path: string, error: Error) => ({
    type: 'fileStorage.action.DidFailToOpen',
    path,
    error,
}));

/**
 * Closes a file that was opened with {@link fileStorageOpen}.
 * @param fd The file descriptor received by {@link fileStorageDidOpen}.
 */
export const fileStorageClose = createAction((fd: FD) => ({
    type: 'fileStorage.action.close',
    fd,
}));

/**
 * Indicates that {@link fileStorageClose} completed.
 * @param fd The file descriptor that was passed to {@link fileStorageClose}.
 */
export const fileStorageDidClose = createAction((fd: FD) => ({
    type: 'fileStorage.action.didClose',
    fd,
}));

// NB: Unlike most "did" actions, closing a file does not fail so there is no
// `fileStorageDidFailToClose` action.

/**
 * Requests to read a file from storage.
 * @param fd An open file descriptor.
 */
export const fileStorageRead = createAction((fd: FD) => ({
    type: 'fileStorage.action.read',
    fd,
}));

/**
 * Indicates that {@link fileStorageRead} succeeded.
 * @param fd The file descriptor passed to {@link fileStorageRead}
 * @param contents The contents of the file.
 */
export const fileStorageDidRead = createAction((fd: FD, contents: string) => ({
    type: 'fileStorage.action.didRead',
    fd,
    contents,
}));

/**
 * Indicates that {@link fileStorageRead} failed.
 * @param fd The file descriptor passed to {@link fileStorageRead}
 * @param error The error.
 */
export const fileStorageDidFailToRead = createAction((fd: FD, error: Error) => ({
    type: 'fileStorage.action.didFailToRead',
    fd,
    error,
}));

/**
 * Requests to write a file to storage.
 * @param fd A file descriptor that is open for writing.
 * @param contents The contents of the file.
 */
export const fileStorageWrite = createAction((fd: FD, contents: string) => ({
    type: 'fileStorage.action.write',
    fd,
    contents,
}));

/**
 * Indicates that {@link fileStorageWrite} succeeded.
 * @param fd The file descriptor passed to {@link fileStorageWrite}
 */
export const fileStorageDidWrite = createAction((fd: FD) => ({
    type: 'fileStorage.action.didWrite',
    fd,
}));

/**
 * Indicates that {@link fileStorageWrite} failed.
 * @param fd The file descriptor passed to {@link fileStorageWrite}
 * @param error The error.
 */
export const fileStorageDidFailToWrite = createAction((fd: FD, error: Error) => ({
    type: 'fileStorage.action.didFailToWrite',
    fd,
    error,
}));

/**
 * Performs file open, read, close.
 * @param path: The file path.
 */
export const fileStorageReadFile = createAction((path: string) => ({
    type: 'fileStorage.action.readFile',
    path,
}));

/**
 * Indicates that {@link fileStorageReadFile} succeeded.
 * @param path: The file path.
 * @param contents: The contents read from the file.
 */
export const fileStorageDidReadFile = createAction(
    (path: string, contents: string) => ({
        type: 'fileStorage.action.didReadFile',
        path,
        contents,
    }),
);

/**
 * Indicates that {@link fileStorageReadFile} failed.
 * @param path: The file path.
 * @param error The error.
 */
export const fileStorageDidFailToReadFile = createAction(
    (path: string, error: Error) => ({
        type: 'fileStorage.action.didFailToReadFile',
        path,
        error,
    }),
);

/**
 * Performs file open, write, close.
 * @param path: The file path.
 * @param contents: The contents read from the file.
 */
export const fileStorageWriteFile = createAction((path: string, contents: string) => ({
    type: 'fileStorage.action.writeFile',
    path,
    contents,
}));

/**
 * Indicates that {@link fileStorageWriteFile} succeeded.
 * @param path: The file path.
 */
export const fileStorageDidWriteFile = createAction((path: string) => ({
    type: 'fileStorage.action.didWriteFile',
    path,
}));

/**
 * Indicates that {@link fileStorageWriteFile} failed.
 * @param path: The file path.
 * @param error The error.
 */
export const fileStorageDidFailToWriteFile = createAction(
    (path: string, error: Error) => ({
        type: 'fileStorage.action.didFailToWriteFile',
        path,
        error,
    }),
);

/**
 * Request to delete a file from storage.
 * @param path: The file path.
 */
export const fileStorageDeleteFile = createAction((path: string) => ({
    type: 'fileStorage.action.deleteFile',
    path,
}));

/**
 * Indicates that {@link fileStorageDeleteFile} succeeded.
 * @param path: The file path.
 */
export const fileStorageDidDeleteFile = createAction((path: string) => ({
    type: 'fileStorage.action.didDeleteFile',
    path,
}));

/**
 *  Indicates that {@link fileStorageDeleteFile} failed.
 * @param path: The file path.
 * @param error The error.
 */
export const fileStorageDidFailToDeleteFile = createAction(
    (path: string, error: Error) => ({
        type: 'fileStorage.action.didFailToDeleteFile',
        path,
        error,
    }),
);

/**
 * Requests for a file to be renamed.
 * @param path: The file path.
 * @param newPath The new path for the file.
 */
export const fileStorageRenameFile = createAction((path: string, newPath: string) => ({
    type: 'fileStorage.action.renameFile',
    path,
    newPath,
}));

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
 * Requests file storage to dump all file paths and contents currently in storage.
 */
export const fileStorageDumpAllFiles = createAction(() => ({
    type: 'fileStorage.action.dumpAllFiles',
}));

/**
 * Indicates that {@link fileStorageDumpAllFiles} succeeded.
 * @param files: An array of all file paths and contents.
 */
export const fileStorageDidDumpAllFiles = createAction(
    (files: ReadonlyArray<Readonly<{ path: string; contents: string }>>) => ({
        type: 'fileStorage.action.didDumpAllFiles',
        files,
    }),
);

/**
 * Indicates that {@link fileStorageDumpAllFiles} succeeded.
 * @param error The error.
 */
export const fileStorageDidFailToDumpAllFiles = createAction((error: Error) => ({
    type: 'fileStorage.action.didFailToDumpAllFiles',
    error,
}));
