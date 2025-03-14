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
 * Action that indicates the Google Drive upload dialog was canceled.
 */
export const googleDriveUploadDialogDidCancel = createAction(() => ({
    type: 'explorer.googleDriveUploadDialog.action.didCancel',
}));
