// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    googleDriveDidSelectFolder,
    googleDriveDidUploadFile,
    googleDriveFailedToUploadFile,
} from '../../googleDrive/actions';
import { DriveDocument } from '../../googleDrive/protocol';
import {
    googleDriveUploadDialogDidCancel,
    googleDriveUploadDialogShow,
} from './actions';

const initialDialogFileName = '';

interface PickedFolder {
    folder?: DriveDocument;
}

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

const descFolder: Reducer<PickedFolder> = (state = {}, action) => {
    if (googleDriveDidSelectFolder.matches(action)) {
        return { folder: action.folder };
    }
    return state;
};

const uploadedDocId: Reducer<string> = (state = '', action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return '';
    }
    if (googleDriveDidUploadFile.matches(action)) {
        return action.uploadedFileId;
    }
    return state;
};

const isUploadFailed: Reducer<boolean> = (state = false, action) => {
    if (googleDriveUploadDialogShow.matches(action)) {
        return false;
    }
    if (googleDriveFailedToUploadFile.matches(action)) {
        return false;
    }
    return state;
};
export default combineReducers({
    isOpen,
    fileName,
    descFolder,
    uploadedDocId,
    isUploadFailed,
});
