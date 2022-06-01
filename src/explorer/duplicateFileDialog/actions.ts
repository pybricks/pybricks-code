// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';

/**
 * Action that requests to show the duplicate file dialog.
 * @param oldName The old file name.
 */
export const duplicateFileDialogShow = createAction((oldName: string) => ({
    type: 'explorer.duplicateFileDialog.action.show',
    oldName,
}));

/**
 * Action that indicates the duplicate file dialog was accepted.
 * @param oldName The old file name.
 * @param newName The new file name.
 */
export const duplicateFileDialogDidAccept = createAction(
    (oldName: string, newName: string) => ({
        type: 'explorer.duplicateFileDialog.action.didAccept',
        oldName,
        newName,
    }),
);

/**
 * Action that indicates the duplicate file dialog was canceled.
 */
export const duplicateFileDialogDidCancel = createAction(() => ({
    type: 'explorer.duplicateFileDialog.action.didCancel',
}));
