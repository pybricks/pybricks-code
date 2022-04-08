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

export const newFileWizardShow = createAction(() => ({
    type: 'explorer.newFileWizard.action.show',
}));

export const newFileWizardDidAccept = createAction(
    (fileName: string, fileExtension: SupportedFileExtension, hubType: Hub) => ({
        type: 'explorer.newFileWizard.action.didAccept',
        fileName,
        fileExtension,
        hubType,
    }),
);

export const newFileWizardDidCancel = createAction(() => ({
    type: 'explorer.newFileWizard.action.didCancel',
}));
