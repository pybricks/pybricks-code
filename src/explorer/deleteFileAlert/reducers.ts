// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    deleteFileAlertDidAccept,
    deleteFileAlertDidCancel,
    deleteFileAlertShow,
} from './actions';

/** Controls the delete file alert dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (deleteFileAlertShow.matches(action)) {
        return true;
    }

    if (
        deleteFileAlertDidAccept.matches(action) ||
        deleteFileAlertDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

/** Controls the file name displayed in the file alert dialog. */
const fileName: Reducer<string> = (state = '', action) => {
    if (deleteFileAlertShow.matches(action)) {
        return action.fileName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
