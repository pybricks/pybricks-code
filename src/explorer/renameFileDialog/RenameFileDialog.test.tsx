// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../../test';
import RenameFileDialog from './RenameFileDialog';
import { renameFileDialogDidAccept, renameFileDialogDidCancel } from './actions';

describe('rename button', () => {
    it('should accept the dialog Rename is clicked', async () => {
        const [dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true, fileName: 'old.file' } },
        });

        const button = dialog.getByRole('button', { name: 'Rename' });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            renameFileDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const [dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true, fileName: 'old.file' } },
        });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new{enter}');

        expect(dispatch).toHaveBeenCalledWith(
            renameFileDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should be cancellable', async () => {
        const [dialog, dispatch] = testRender(<RenameFileDialog />, {
            explorer: { renameFileDialog: { isOpen: true } },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(renameFileDialogDidCancel());
    });
});
