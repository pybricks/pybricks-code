// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    renameFileDialogDidAccept,
    renameFileDialogDidCancel,
    renameFileDialogShow,
} from './actions';

const initialDialogFileName = '';

/** Controls the rename file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (renameFileDialogShow.matches(action)) {
        return true;
    }

    if (
        renameFileDialogDidAccept.matches(action) ||
        renameFileDialogDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

/** Controls the rename file dialog file name input box text. */
const fileName: Reducer<string> = (state = initialDialogFileName, action) => {
    if (renameFileDialogShow.matches(action)) {
        return action.oldName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
