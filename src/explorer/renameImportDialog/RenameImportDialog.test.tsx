// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import RenameImportDialog from './RenameImportDialog';
import { renameImportDialogDidAccept, renameImportDialogDidCancel } from './actions';

describe('rename button', () => {
    it('should accept the dialog Rename is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
            explorer: { renameImportDialog: { isOpen: true, fileName: 'old.file' } },
        });

        const button = dialog.getByRole('button', { name: 'Rename' });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        await act(() => user.type(input, 'new', { skipClick: true }));
        await waitFor(() => expect(button).not.toBeDisabled());

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(
            renameImportDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
            explorer: { renameImportDialog: { isOpen: true, fileName: 'old.file' } },
        });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        await act(() => user.type(input, 'new{Enter}', { skipClick: true }));

        expect(dispatch).toHaveBeenCalledWith(
            renameImportDialogDidAccept('old.file', 'new.file'),
        );
    });

    it('should cancel when close button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
            explorer: { renameImportDialog: { isOpen: true } },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(renameImportDialogDidCancel());
    });

    it('should cancel when skip button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
            explorer: { renameImportDialog: { isOpen: true } },
        });

        const button = dialog.getByRole('button', { name: 'Skip importing this file' });

        await waitFor(() => expect(button).toBeVisible());

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(renameImportDialogDidCancel());
    });
});
