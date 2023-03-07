// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { createAction } from '../../actions';

/**
 * Action that requests to show the replace file dialog.
 * @param fileName The file name.
 */
export const replaceImportDialogShow = createAction((fileName: string) => ({
    type: 'explorer.replaceImportDialog.action.show',
    fileName,
}));

export enum ReplaceImportDialogAction {
    Skip = 'skip',
    Replace = 'replace',
    Rename = 'rename',
}

/**
 * Action that indicates the replace file dialog was accepted.
 */
export const replaceImportDialogDidAccept = createAction(
    (action: ReplaceImportDialogAction, remember: boolean) => ({
        type: 'explorer.replaceImportDialog.action.didAccept',
        action,
        remember,
    }),
);

/**
 * Action that indicates the replace file dialog was canceled.
 */
export const replaceImportDialogDidCancel = createAction(() => ({
    type: 'explorer.replaceImportDialog.action.didCancel',
}));
