// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../../test';
import NewFileWizard from './NewFileWizard';
import { Hub, newFileWizardDidAccept, newFileWizardDidCancel } from './actions';

afterEach(() => {
    cleanup();
});

describe('accept', () => {
    it('should dispatch accept action when button is clicked', async () => {
        const [dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        const button = dialog.getByLabelText('Create');

        // have to type a file name before Create button is enabled
        userEvent.type(dialog.getByRole('textbox', { name: 'File name' }), 'test');
        await waitFor(() => expect(button).not.toBeDisabled());

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            newFileWizardDidAccept('test', '.py', Hub.Technic),
        );
    });

    it('should dispatch accept action when enter is pressed ', async () => {
        const [dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        userEvent.type(
            dialog.getByRole('textbox', { name: 'File name' }),
            'test{enter}',
        );

        expect(dispatch).toHaveBeenCalledWith(
            newFileWizardDidAccept('test', '.py', Hub.Technic),
        );
    });
});

describe('cancel', () => {
    it('should dispatch cancel when close button is clicked', () => {
        const [dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        userEvent.click(dialog.getByRole('button', { name: 'Close' }));

        expect(dispatch).toHaveBeenCalledWith(newFileWizardDidCancel());
    });

    it('should dispatch cancel when escape button is pressed', async () => {
        const [dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        await waitFor(() =>
            expect(dialog.getByRole('textbox', { name: 'File name' })).toHaveFocus(),
        );

        userEvent.keyboard('{esc}');

        expect(dispatch).toHaveBeenCalledWith(newFileWizardDidCancel());
    });
});
