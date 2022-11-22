// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import React from 'react';
import { testRender } from '../../../test';
import DuplicateFileDialog from './DuplicateFileDialog';
import { duplicateFileDialogDidAccept, duplicateFileDialogDidCancel } from './actions';

describe('duplicate button', () => {
    it('should accept the dialog Duplicate is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        const button = dialog.getByRole('button', { name: 'Duplicate' });

        // have to type a new file name before Duplicate button is enabled
        const input = dialog.getByRole('textbox', { name: 'File name' });
        await waitFor(() => expect(input).toHaveFocus());
        await user.type(input, 'new', { skipClick: true });
        await waitFor(() => expect(button).not.toBeDisabled());

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            duplicateFileDialogDidAccept('source.file', 'new.file'),
        );
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const [user, dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        // have to type a new file name before Duplicate button is enabled
        const input = dialog.getByRole('textbox', { name: 'File name' });
        await waitFor(() => expect(input).toHaveFocus());
        await user.type(input, 'new{Enter}', { skipClick: true });

        expect(dispatch).toHaveBeenCalledWith(
            duplicateFileDialogDidAccept('source.file', 'new.file'),
        );
    });

    it('should cancel when user clicks close button', async () => {
        const [user, dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(duplicateFileDialogDidCancel());
    });

    it('should cancel when user user presses esc key', async () => {
        const [user, dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        await waitFor(() =>
            expect(dialog.getByRole('textbox', { name: 'File name' })).toHaveFocus(),
        );

        await user.keyboard('{Escape}');

        expect(dispatch).toHaveBeenCalledWith(duplicateFileDialogDidCancel());
    });
});
