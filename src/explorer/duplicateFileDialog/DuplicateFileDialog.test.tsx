// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../../test';
import DuplicateFileDialog from './DuplicateFileDialog';
import { duplicateFileDialogDidAccept, duplicateFileDialogDidCancel } from './actions';

describe('duplicate button', () => {
    it('should accept the dialog Duplicate is clicked', async () => {
        const [dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        const button = dialog.getByRole('button', { name: 'Duplicate' });

        // have to type a new file name before Duplicate button is enabled
        const input = dialog.getByRole('textbox', { name: 'File name' });
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            duplicateFileDialogDidAccept('source.file', 'new.file'),
        );
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const [dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        // have to type a new file name before Duplicate button is enabled
        const input = dialog.getByRole('textbox', { name: 'File name' });
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new{enter}');

        expect(dispatch).toHaveBeenCalledWith(
            duplicateFileDialogDidAccept('source.file', 'new.file'),
        );
    });

    it('should cancel when user clicks close button', async () => {
        const [dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(duplicateFileDialogDidCancel());
    });

    it('should cancel when user user presses esc key', async () => {
        const [dialog, dispatch] = testRender(<DuplicateFileDialog />, {
            explorer: {
                duplicateFileDialog: { isOpen: true, fileName: 'source.file' },
            },
        });

        await waitFor(() =>
            expect(dialog.getByRole('textbox', { name: 'File name' })).toHaveFocus(),
        );

        userEvent.keyboard('{esc}');

        expect(dispatch).toHaveBeenCalledWith(duplicateFileDialogDidCancel());
    });
});
