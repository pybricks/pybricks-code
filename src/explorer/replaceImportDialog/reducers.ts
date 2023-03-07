// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    replaceImportDialogDidAccept,
    replaceImportDialogDidCancel,
    replaceImportDialogShow,
} from './actions';

/** Controls the replace file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (replaceImportDialogShow.matches(action)) {
        return true;
    }

    if (
        replaceImportDialogDidAccept.matches(action) ||
        replaceImportDialogDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

/** Controls the replace file dialog file name input box text. */
const fileName: Reducer<string> = (state = '', action) => {
    if (replaceImportDialogShow.matches(action)) {
        return action.fileName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
