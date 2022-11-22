// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import DeleteFileAlert from './DeleteFileAlert';
import { deleteFileAlertDidAccept, deleteFileAlertDidCancel } from './actions';

afterEach(() => {
    cleanup();
});

describe('accept', () => {
    it('should dispatch accept action when delete button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<DeleteFileAlert />, {
            explorer: { deleteFileAlert: { fileName: 'test.file', isOpen: true } },
        });

        await user.click(dialog.getByRole('button', { name: 'Delete' }));
        expect(dispatch).toHaveBeenCalledWith(deleteFileAlertDidAccept());
    });

    it('should dispatch accept action when enter is pressed ', async () => {
        const [user, dialog, dispatch] = testRender(<DeleteFileAlert />, {
            explorer: { deleteFileAlert: { fileName: 'test.file', isOpen: true } },
        });

        await waitFor(() =>
            expect(dialog.getByRole('button', { name: 'Delete' })).toHaveFocus(),
        );
        await user.keyboard('{Enter}');

        expect(dispatch).toHaveBeenCalledWith(deleteFileAlertDidAccept());
    });
});

describe('cancel', () => {
    it('should dispatch cancel when keep button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<DeleteFileAlert />, {
            explorer: { deleteFileAlert: { fileName: 'test.file', isOpen: true } },
        });

        await user.click(dialog.getByRole('button', { name: 'Keep' }));

        expect(dispatch).toHaveBeenCalledWith(deleteFileAlertDidCancel());
    });

    it('should dispatch cancel when escape button is pressed', async () => {
        const [user, dialog, dispatch] = testRender(<DeleteFileAlert />, {
            explorer: { deleteFileAlert: { fileName: 'test.file', isOpen: true } },
        });

        await waitFor(() =>
            expect(dialog.getByRole('button', { name: 'Delete' })).toHaveFocus(),
        );

        await user.keyboard('{Escape}');

        expect(dispatch).toHaveBeenCalledWith(deleteFileAlertDidCancel());
    });
});
