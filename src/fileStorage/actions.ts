// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import type * as monaco from 'monaco-editor';
import { createAction } from '../actions';
import { FileMetadata, UUID } from '.';

/** File open modes. */
export type FileOpenMode = 'r' | 'w';

/** Type to avoid mixing up file descriptor with number. */
export type FD = number & { _fdBrand: undefined };

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
 * Action that requests to open a file in storage.
 * @param path The file path.
 * @param mode 'r' to open for reading or 'w' to open for writing.
 * @param create If true, create the file if it does not exist.
 */
export const fileStorageOpen = createAction(
    (path: string, mode: FileOpenMode, create: boolean) => ({
        type: 'fileStorage.action.Open',
        path,
        mode,
        create,
    }),
);

/**
 * Action that indicates that {@link fileStorageOpen} succeeded.
 * @param path The file path.
 * @param uuid The UUID of the file metadata.
 * @param fd The file descriptor.
 */
export const fileStorageDidOpen = createAction((path: string, uuid: UUID, fd: FD) => ({
    type: 'fileStorage.action.DidOpen',
    path,
    uuid,
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
 * @param uuid: The UUID of the file metadata.
 */
export const fileStorageDidWriteFile = createAction((path: string, uuid: UUID) => ({
    type: 'fileStorage.action.didWriteFile',
    path,
    uuid,
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
 * Request to copy a file from storage.
 * @param path: The path of the file to be copied.
 * @param newPath: The path of the new file to be created.
 */
export const fileStorageCopyFile = createAction((path: string, newPath: string) => ({
    type: 'fileStorage.action.copyFile',
    path,
    newPath,
}));

/**
 * Indicates that {@link fileStorageCopyFile} succeeded.
 * @param path: The file path.
 */
export const fileStorageDidCopyFile = createAction((path: string) => ({
    type: 'fileStorage.action.didCopyFile',
    path,
}));

/**
 *  Indicates that {@link fileStorageCopyFile} failed.
 * @param path: The file path.
 * @param error The error.
 */
export const fileStorageDidFailToCopyFile = createAction(
    (path: string, error: Error) => ({
        type: 'fileStorage.action.didFailToCopyFile',
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

export const fileStorageLoadTextFile = createAction((uuid: UUID) => ({
    type: 'fileStorage.action.loadTextFile',
    uuid,
}));

export const fileStorageDidLoadTextFile = createAction(
    (
        uuid: UUID,
        value: string,
        viewState: monaco.editor.ICodeEditorViewState | null,
    ) => ({
        type: 'fileStorage.action.didLoadTextFile',
        uuid,
        value,
        viewState,
    }),
);

export const fileStorageDidFailToLoadTextFile = createAction(
    (uuid: UUID, error: Error) => ({
        type: 'fileStorage.action.didFailToLoadTextFile',
        uuid,
        error,
    }),
);

export const fileStorageStoreTextFileValue = createAction(
    (uuid: UUID, value: string) => ({
        type: 'fileStorage.action.storeTextFileValue',
        uuid,
        value,
    }),
);

export const fileStorageDidStoreTextFileValue = createAction((uuid: UUID) => ({
    type: 'fileStorage.action.didStoreTextFileValue',
    uuid,
}));

export const fileStorageDidFailToStoreTextFileValue = createAction(
    (uuid: UUID, error: Error) => ({
        type: 'fileStorage.action.didFailToStoreTextFileValue',
        uuid,
        error,
    }),
);

export const fileStorageStoreTextFileViewState = createAction(
    (uuid: UUID, viewState: monaco.editor.ICodeEditorViewState | null) => ({
        type: 'fileStorage.action.storeTextFileViewState',
        uuid,
        viewState,
    }),
);

export const fileStorageDidStoreTextFileViewState = createAction((uuid: UUID) => ({
    type: 'fileStorage.action.didStoreTextFileViewState',
    uuid,
}));

export const fileStorageDidFailToStoreTextFileViewState = createAction(
    (uuid: UUID, error: Error) => ({
        type: 'fileStorage.action.didFailToStoreTextFileViewState',
        uuid,
        error,
    }),
);
