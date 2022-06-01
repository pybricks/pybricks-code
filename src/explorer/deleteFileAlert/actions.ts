// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';

/**
 * Requests to show the delete file alert dialog.
 * @param fileName The file name to display to the user.
 */
export const deleteFileAlertShow = createAction((fileName: string) => ({
    type: 'explorer.deleteFileAlert.action.show',
    fileName,
}));

/**
 * Indicates that the user accepted the delete file alert dialog.
 */
export const deleteFileAlertDidAccept = createAction(() => ({
    type: 'explorer.deleteFileAlert.action.didAccept',
}));

/**
 * Indicates that the user canceled the delete file alert dialog.
 */
export const deleteFileAlertDidCancel = createAction(() => ({
    type: 'explorer.deleteFileAlert.action.didCancel',
}));
