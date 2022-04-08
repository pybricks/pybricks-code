// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    duplicateFileDialogDidAccept,
    duplicateFileDialogDidCancel,
    duplicateFileDialogShow,
} from './actions';

/** Controls the duplicate file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (duplicateFileDialogShow.matches(action)) {
        return true;
    }

    if (
        duplicateFileDialogDidAccept.matches(action) ||
        duplicateFileDialogDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

/** Controls the duplicate file dialog file name input box text. */
const fileName: Reducer<string> = (state = '', action) => {
    if (duplicateFileDialogShow.matches(action)) {
        return action.oldName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
