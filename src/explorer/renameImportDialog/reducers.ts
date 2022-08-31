// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    renameImportDialogDidAccept,
    renameImportDialogDidCancel,
    renameImportDialogShow,
} from './actions';

/** Controls the rename file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (renameImportDialogShow.matches(action)) {
        return true;
    }

    if (
        renameImportDialogDidAccept.matches(action) ||
        renameImportDialogDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

/** Controls the rename file dialog file name input box text. */
const fileName: Reducer<string> = (state = '', action) => {
    if (renameImportDialogShow.matches(action)) {
        return action.oldName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
