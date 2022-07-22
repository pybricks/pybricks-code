// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fireEvent, waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import { Hub } from '../../components/hubPicker';
import NewFileWizard from './NewFileWizard';
import { newFileWizardDidAccept, newFileWizardDidCancel } from './actions';

afterEach(() => {
    cleanup();
});

describe('accept', () => {
    it('should dispatch accept action when button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        const button = dialog.getByLabelText('Create');

        // have to type a file name before Create button is enabled
        await user.type(dialog.getByRole('textbox', { name: 'File name' }), 'test');
        await waitFor(() => expect(button).not.toBeDisabled());

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(
            newFileWizardDidAccept('test', '.py', Hub.Technic),
        );
    });

    it('should dispatch accept action when enter is pressed ', async () => {
        const [user, dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        await user.type(
            dialog.getByRole('textbox', { name: 'File name' }),
            'test{Enter}',
        );

        expect(dispatch).toHaveBeenCalledWith(
            newFileWizardDidAccept('test', '.py', Hub.Technic),
        );
    });
});

describe('cancel', () => {
    it('should dispatch cancel when close button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        await user.click(dialog.getByRole('button', { name: 'Close' }));

        expect(dispatch).toHaveBeenCalledWith(newFileWizardDidCancel());
    });

    it('should dispatch cancel when escape button is pressed', async () => {
        const [user, dialog, dispatch] = testRender(<NewFileWizard />, {
            explorer: { newFileWizard: { isOpen: true } },
        });

        await waitFor(() =>
            expect(dialog.getByRole('textbox', { name: 'File name' })).toHaveFocus(),
        );

        // FIXME: use userEvent instead of fireEvent
        // blocked by https://github.com/palantir/blueprint/pull/5349
        // await user.keyboard('{Escape}');
        user;
        fireEvent.keyDown(document.activeElement ?? document, {
            key: 'Escape',
            keyCode: 27,
            which: 27,
        });

        expect(dispatch).toHaveBeenCalledWith(newFileWizardDidCancel());
    });
});
