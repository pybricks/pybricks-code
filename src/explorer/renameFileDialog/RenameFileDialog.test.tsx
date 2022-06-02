// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import React from 'react';
import { testRender } from '../../../test';
import RenameFileDialog from './RenameFileDialog';
import { renameFileDialogDidAccept, renameFileDialogDidCancel } from './actions';

describe('rename button', () => {
    it('should accept the dialog Rename is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true, fileName: 'old.file' } },
        });

        const button = dialog.getByRole('button', { name: 'Rename' });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        await user.type(input, 'new', { skipClick: true });
        await waitFor(() => expect(button).not.toBeDisabled());

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            renameFileDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const [user, dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true, fileName: 'old.file' } },
        });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        await user.type(input, 'new{Enter}', { skipClick: true });

        expect(dispatch).toHaveBeenCalledWith(
            renameFileDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should be cancellable', async () => {
        const [user, dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true } },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(renameFileDialogDidCancel());
    });
});
