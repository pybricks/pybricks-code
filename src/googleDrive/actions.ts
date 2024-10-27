// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { createAction } from '../actions';
import { DriveDocument } from './protocol';

export const googleDriveDidSelectFolder = createAction((folder: DriveDocument) => ({
    type: 'googleDrive.action.didSelectFolder',
    folder,
}));

export const googleDriveUploadFile = createAction(
    (fileName: string, targetFolderId: string) => ({
        type: 'googleDrive.action.uploadFile',
        fileName,
        targetFolderId,
    }),
);

export const googleDriveDidUploadFile = createAction(
    (uploadedFileId: string, overwroteExistingFile: boolean) => ({
        type: 'googleDrive.action.didUploadFile',
        uploadedFileId,
        overwroteExistingFile,
    }),
);

export const googleDriveFailToUploadFile = createAction((err: Error) => ({
    type: 'googleDrive.action.failToUploadFile',
    err,
}));

export const googleDriveSelectDownloadFiles = createAction(() => ({
    type: 'googleDrive.action.selectDownloadFiles',
}));

export const googleDriveDidSelectDownloadFiles = createAction(
    (files: DriveDocument[]) => ({
        type: 'googleDrive.action.didSelectDownloadFiles',
        files,
    }),
);

export const googleDriveSelectDownloadFilesCancelled = createAction(() => ({
    type: 'googleDrive.action.selectDownloadFilesCancelled',
}));

export const googleDriveDownloadFile = createAction((file: DriveDocument) => ({
    type: 'googleDrive.action.downloadFile',
    file,
}));

export const googleDriveDidDownloadFile = createAction(
    (file: DriveDocument, content: string) => ({
        type: 'googleDrive.action.didDownloadFile',
        file,
        content,
    }),
);

export const googleDriveFailToDownloadFile = createAction((file: DriveDocument) => ({
    type: 'googleDrive.action.failToDownloadFile',
    file,
}));
