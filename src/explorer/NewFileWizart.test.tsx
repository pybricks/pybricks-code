// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import NewFileWizard from './NewFileWizard';

describe('create button', () => {
    it('should close the dialog', async () => {
        const onClose = jest.fn();
        const [dialog] = testRender(<NewFileWizard isOpen={true} onClose={onClose} />);

        const button = dialog.getByLabelText('Create');

        // have to type a file name before Create button is enabled
        userEvent.type(dialog.getByLabelText('File name'), 'test');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(onClose).toHaveBeenCalled();
    });
});
