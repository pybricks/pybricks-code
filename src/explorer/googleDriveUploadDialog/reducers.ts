// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    googleDriveUploadDialogDidCancel,
    googleDriveUploadDialogDidUploadFile,
    googleDriveUploadDialogFailedToUploadFile,
    googleDriveUploadDialogShow,
} from './actions';

const initialDialogFileName = '';

/** Controls the Google Drive upload file dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return true;
    }

    if (googleDriveUploadDialogDidCancel.matches(action)) {
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

const driveDocId: Reducer<string> = (state = '', action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return '';
    }
    if (googleDriveUploadDialogDidUploadFile.matches(action)) {
        return action.googleDriveDocId;
    }
    return state;
};

const isUploadFailed: Reducer<boolean> = (state = false, action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return false;
    }
    if (googleDriveUploadDialogFailedToUploadFile.matches(action)) {
        return false;
    }
    return state;
};
export default combineReducers({
    isOpen,
    fileName,
    driveDocId,
    isUploadFailed,
});
