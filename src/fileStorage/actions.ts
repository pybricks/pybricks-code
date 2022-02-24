// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Action } from 'redux';

export enum FileStorageActionType {
    /** Action that indicates that the storage backend is ready to use. */
    DidInitialize = 'fileStorage.action.didInitialize',
    /** Action that indicates that the storage backend failed to initialize. */
    DidFailToInitialize = 'fileStorage.action.didFailToInitialize',
    /** Action that indicates that an item in the storage was created or changed by us or in another tab. */
    DidChangeItem = 'fileStorage.action.didChangeItem',
    /** Action that indicates that an item in the storage was removed by us or in another tab. */
    DidRemoveItem = 'fileStorage.action.didRemoveItem',
    /** Requests to read a file from storage. */
    ReadFile = 'fileStorage.action.readFile',
    /** Response to read file request indicating success. */
    DidReadFile = 'fileStorage.action.didReadFile',
    /** Response to read file request indicating failure. */
    DidFailToReadFile = 'fileStorage.action.didFailToReadFile',
    /** Requests to write a file to storage. */
    WriteFile = 'fileStorage.action.writeFile',
    /** Response to write file request indicating success. */
    DidWriteFile = 'fileStorage.action.didWriteFile',
    /** Response to write file request indicating failure. */
    DidFailToWriteFile = 'fileStorage.action.didFailToWriteFile',
}

/** Action that indicates that the storage backend is ready to use. */
export type FileStorageDidInitializeAction =
    Action<FileStorageActionType.DidInitialize>;

/** Action that indicates that the storage backend is ready to use. */
export function fileStorageDidInitialize(): FileStorageDidInitializeAction {
    return { type: FileStorageActionType.DidInitialize };
}

/** Action that indicates that the storage backend failed to initialize. */
export type FileStorageDidFailToInitializeAction =
    Action<FileStorageActionType.DidFailToInitialize> & { error: Error };

/** Action that indicates that the storage backend failed to initialize. */
export function fileStorageDidFailToInitialize(
    err: Error,
): FileStorageDidFailToInitializeAction {
    return { type: FileStorageActionType.DidFailToInitialize, error: err };
}

/** Action that indicates that an item in the storage was created or changed by us or in another tab. */
export type FileStorageDidChangeItemAction =
    Action<FileStorageActionType.DidChangeItem> & {
        fileName: string;
    };

/** Action that indicates that an item in the storage was created or changed by us or in another tab. */
export function fileStorageDidChangeItem(
    fileName: string,
): FileStorageDidChangeItemAction {
    return { type: FileStorageActionType.DidChangeItem, fileName };
}

/** Action that indicates that an item in the storage was removed by us or in another tab. */
export type FileStorageDidRemoveItemAction =
    Action<FileStorageActionType.DidRemoveItem> & {
        fileName: string;
    };

/** Action that indicates that an item in the storage was removed by us or in another tab. */
export function fileStorageDidRemoveItem(
    fileName: string,
): FileStorageDidRemoveItemAction {
    return { type: FileStorageActionType.DidRemoveItem, fileName };
}

/** Requests to read a file from storage. */
export type FileStorageReadFileAction = Action<FileStorageActionType.ReadFile> & {
    fileName: string;
};

/** Requests to read a file from storage. */
export function fileStorageReadFile(fileName: string): FileStorageReadFileAction {
    return { type: FileStorageActionType.ReadFile, fileName };
}

/** Response to read file request indicating success. */
export type FileStorageDidReadFileAction = Action<FileStorageActionType.DidReadFile> & {
    fileName: string;
    fileContents: string;
};

/** Response to read file request indicating success. */
export function fileStorageDidReadFile(
    fileName: string,
    fileContents: string,
): FileStorageDidReadFileAction {
    return { type: FileStorageActionType.DidReadFile, fileName, fileContents };
}

/** Response to read file request indicating failure. */
export type FileStorageDidFailToReadFileAction =
    Action<FileStorageActionType.DidFailToReadFile> & {
        fileName: string;
        error: Error;
    };

/** Response to read file request indicating failure. */
export function fileStorageDidFailToReadFile(
    fileName: string,
    error: Error,
): FileStorageDidFailToReadFileAction {
    return { type: FileStorageActionType.DidFailToReadFile, fileName, error };
}

/** Requests to write a file to storage. */
export type FileStorageWriteFileAction = Action<FileStorageActionType.WriteFile> & {
    fileName: string;
    fileContents: string;
};

/** Requests to write a file to storage. */
export function fileStorageWriteFile(
    fileName: string,
    fileContents: string,
): FileStorageWriteFileAction {
    return { type: FileStorageActionType.WriteFile, fileName, fileContents };
}

/** Response to write file request indicating success. */
export type FileStorageDidWriteFileAction =
    Action<FileStorageActionType.DidWriteFile> & {
        fileName: string;
    };

/** Response to write file request indicating success. */
export function fileStorageDidWriteFile(
    fileName: string,
): FileStorageDidWriteFileAction {
    return { type: FileStorageActionType.DidWriteFile, fileName };
}

/** Response to write file request indicating failure. */
export type FileStorageDidFailToWriteFileAction =
    Action<FileStorageActionType.DidFailToWriteFile> & {
        fileName: string;
        error: Error;
    };

/** Response to write file request indicating failure. */
export function fileStorageDidFailToWriteFile(
    fileName: string,
    error: Error,
): FileStorageDidFailToWriteFileAction {
    return { type: FileStorageActionType.DidFailToWriteFile, fileName, error };
}

/**
 * Common type for all file storage actions.
 */
export type FileStorageAction =
    | FileStorageDidInitializeAction
    | FileStorageDidFailToInitializeAction
    | FileStorageDidChangeItemAction
    | FileStorageDidRemoveItemAction
    | FileStorageReadFileAction
    | FileStorageDidReadFileAction
    | FileStorageDidFailToReadFileAction
    | FileStorageWriteFileAction
    | FileStorageDidWriteFileAction
    | FileStorageDidFailToWriteFileAction;
