// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    googleDriveUploadDialogDidAccept,
    googleDriveUploadDialogShow,
} from './actions';

const initialDialogFileName = '';

/** Controls the Google Drive upload file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return true;
    }

    if (
        googleDriveUploadDialogDidAccept.matches(action) ||
        googleDriveUploadDialogDidAccept.matches(action)
    ) {
        return false;
    }

    return state;
};

const fileName: Reducer<string> = (state = initialDialogFileName, action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return action.fileName;
    }

    return state;
};

export default combineReducers({ isOpen, fileName });
