// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { combineReducers } from 'redux';

import deleteFileAlert from './deleteFileAlert/reducers';
import duplicateFileDialog from './duplicateFileDialog/reducers';
import googleDriveUploadDialog from './googleDriveUploadDialog/reducers';
import newFileWizard from './newFileWizard/reducers';
import renameFileDialog from './renameFileDialog/reducers';
import renameImportDialog from './renameImportDialog/reducers';
import replaceImportDialog from './replaceImportDialog/reducers';

export default combineReducers({
    duplicateFileDialog,
    deleteFileAlert,
    newFileWizard,
    renameFileDialog,
    renameImportDialog,
    replaceImportDialog,
    googleDriveUploadDialog,
});
