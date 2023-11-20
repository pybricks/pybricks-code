// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { createAction } from '../../actions';
import { Hub } from '../../components/hubPicker';
import { ProgramType } from '../../components/programTypePicker';

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
 * @param programType The user-provided program type.
 * @param fileName The user-provided file name.
 * @param fileExtension The user-provided file extension.
 * @param hubType The user-provided hub type or undefined for an empty file.
 */
export const newFileWizardDidAccept = createAction(
    (
        programType: ProgramType | undefined,
        fileName: string,
        fileExtension: SupportedFileExtension,
        hubType: Hub | undefined,
    ) => ({
        type: 'explorer.newFileWizard.action.didAccept',
        programType,
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
