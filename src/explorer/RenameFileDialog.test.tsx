// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import { fileStorageRenameFile } from '../fileStorage/actions';
import RenameFileDialog from './RenameFileDialog';

describe('rename button', () => {
    it('should close the dialog and dispatch an action when Rename is clicked', async () => {
        const onClose = jest.fn();
        const [dialog, dispatch] = testRender(
            <RenameFileDialog oldName="old.file" isOpen={true} onClose={onClose} />,
        );

        const button = dialog.getByLabelText('Rename');

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(onClose).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(
            fileStorageRenameFile('old.file', 'new.file'),
        );
    });

    it('should be cancellable', async () => {
        const onClose = jest.fn();

        const [dialog, dispatch] = testRender(
            <RenameFileDialog oldName="old.file" isOpen={true} onClose={onClose} />,
        );

        const button = dialog.getByLabelText('Close');

        await waitFor(() => expect(button).toBeVisible());

        userEvent.click(button);
        expect(onClose).toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
