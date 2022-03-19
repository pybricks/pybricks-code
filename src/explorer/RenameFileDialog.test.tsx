// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import RenameFileDialog from './RenameFileDialog';

describe('rename button', () => {
    it('should accept the dialog Rename is clicked', async () => {
        const onAccept = jest.fn();
        const onCancel = jest.fn();
        const [dialog] = testRender(
            <RenameFileDialog
                oldName="old.file"
                isOpen={true}
                onAccept={onAccept}
                onCancel={onCancel}
            />,
        );

        const button = dialog.getByRole('button', { name: 'Rename' });

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(onAccept).toHaveBeenCalledWith('old.file', 'new.file');
    });

    it('should accept the dialog when enter is pressed in the text input', async () => {
        const onAccept = jest.fn();
        const onCancel = jest.fn();
        const [dialog] = testRender(
            <RenameFileDialog
                oldName="old.file"
                isOpen={true}
                onAccept={onAccept}
                onCancel={onCancel}
            />,
        );

        // have to type a new file name before Rename button is enabled
        const input = dialog.getByLabelText('File name');
        await waitFor(() => expect(input).toHaveFocus());
        userEvent.type(input, 'new{enter}');

        expect(onAccept).toHaveBeenCalledWith('old.file', 'new.file');
    });

    it('should be cancellable', async () => {
        const onAccept = jest.fn();
        const onCancel = jest.fn();

        const [dialog, dispatch] = testRender(
            <RenameFileDialog
                oldName="old.file"
                isOpen={true}
                onAccept={onAccept}
                onCancel={onCancel}
            />,
        );

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        userEvent.click(button);
        expect(onCancel).toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
