// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';

import { pythonFileExtension } from '../../pybricksMicropython/lib';

/** Supported file extensions. */
type SupportedFileExtension = typeof pythonFileExtension;

/** Supported hub types. */
export enum Hub {
    /** BOOST Move hub */
    Move = 'movehub',
    /** City hub */
    City = 'cityhub',
    /** Technic hub */
    Technic = 'technichub',
    /** MINDSTORMS Robot Inventor hub */
    Inventor = 'inventorhub',
    /** SPIKE Prime hub */
    Prime = 'primehub',
    /** SPIKE Essential hub */
    Essential = 'essentialhub',
}

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
