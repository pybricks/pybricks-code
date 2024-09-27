// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { createAction } from '../../actions';

/**
 * Action that requests to show the Google Drive upload dialog.
 * @param fileName The name of the local file to be uploaded.
 */
export const googleDriveUploadDialogShow = createAction((fileName: string) => ({
    type: 'explorer.googleDriveUploadDialog.action.show',
    fileName,
}));

/**
 * Action that requests to start uploading.
 * @param fileName The name of the local file to be uploaded.
 * @param authToken The Google API auth token.
 * @param targetFolderId The target Google Drive folder id.
 */
export const googleDriveUploadDialogUpload = createAction(
    (fileName: string, authToken: string, targetFolderId: string) => ({
        type: 'explorer.googleDriveUploadDialog.action.didAccept',
        fileName,
        authToken,
        targetFolderId,
    }),
);

/**
 * Action that indicates the upload was finished.
 * @param googleDriveDocId The Google Drive doc id of the uploaded file.
 */
export const googleDriveUploadDialogDidUploadFile = createAction(
    (googleDriveDocId: string) => ({
        type: 'explorer.googleDriveUploadDialog.action.didUploadFile',
        googleDriveDocId,
    }),
);

/**
 * Action that indicates the upload was failed.
 * @param error The error from Google Drive API.
 */
export const googleDriveUploadDialogFailedToUploadFile = createAction(
    (error: Error) => ({
        type: 'explorer.googleDriveUploadDialog.action.failedToUploadFile',
        error,
    }),
);

/**
 * Action that indicates the Google Drive upload dialog was canceled.
 */
export const googleDriveUploadDialogDidCancel = createAction(() => ({
    type: 'explorer.googleDriveUploadDialog.action.didCancel',
}));
