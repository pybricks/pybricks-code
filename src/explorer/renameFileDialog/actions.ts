// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';

/**
 * Action that requests to show the rename file dialog.
 * @param oldName The old file name.
 */
export const renameFileDialogShow = createAction((oldName: string) => ({
    type: 'explorer.renameFileDialog.action.show',
    oldName,
}));

/**
 * Action that indicates the rename file dialog was accepted.
 * @param oldName The old file name.
 * @param newName The new file name.
 */
export const renameFileDialogDidAccept = createAction(
    (oldName: string, newName: string) => ({
        type: 'explorer.renameFileDialog.action.didAccept',
        oldName,
        newName,
    }),
);

/**
 * Action that indicates the rename file dialog was canceled.
 */
export const renameFileDialogDidCancel = createAction(() => ({
    type: 'explorer.renameFileDialog.action.didCancel',
}));
