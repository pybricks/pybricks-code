// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';
import { Hub } from '../../components/hubPicker';

import { pythonFileExtension } from '../../pybricksMicropython/lib';

/** Supported file extensions. */
type SupportedFileExtension = typeof pythonFileExtension;

/**
 * Requests to show the new file wizard dialog.
 */
export const newFileWizardShow = createAction(() => ({
    type: 'explorer.newFileWizard.action.show',
}));

/**
 * Indicates that the use accepted the new file wizard dialog.
 * @param fileName The user-provided file name.
 * @param fileExtension The user-provided file extension.
 * @param hubType The user-provided hub type.
 */
export const newFileWizardDidAccept = createAction(
    (fileName: string, fileExtension: SupportedFileExtension, hubType: Hub) => ({
        type: 'explorer.newFileWizard.action.didAccept',
        fileName,
        fileExtension,
        hubType,
    }),
);

/**
 * Indicates that the use accepted the new file wizard dialog.
 */
export const newFileWizardDidCancel = createAction(() => ({
    type: 'explorer.newFileWizard.action.didCancel',
}));
