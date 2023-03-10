// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import RenameImportDialog from './ReplaceImportDialog';
import {
    ReplaceImportDialogAction,
    replaceImportDialogDidAccept,
    replaceImportDialogDidCancel,
} from './actions';

describe('replace button', () => {
    it.each([
        [/skip/i, ReplaceImportDialogAction.Skip, false],
        [/skip/i, ReplaceImportDialogAction.Skip, true],
        [/replace/i, ReplaceImportDialogAction.Replace, false],
        [/replace/i, ReplaceImportDialogAction.Replace, true],
        [/rename/i, ReplaceImportDialogAction.Rename, false],
        [/rename/i, ReplaceImportDialogAction.Rename, true],
    ])(
        'should accept when %c%s button is clicked and remember checkbox is %s',
        async (buttonName, action, remember) => {
            const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
                explorer: {
                    replaceImportDialog: { isOpen: true, fileName: 'old.file' },
                },
            });

            if (remember) {
                const rememberCheckBox = dialog.getByRole('checkbox', {
                    name: /remember/i,
                });
                await act(() => user.click(rememberCheckBox));
            }

            const button = dialog.getByRole('button', { name: buttonName });
            await act(() => user.click(button));

            expect(dispatch).toHaveBeenCalledWith(
                replaceImportDialogDidAccept(action, remember),
            );
        },
    );

    it('should cancel when close button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RenameImportDialog />, {
            explorer: { replaceImportDialog: { isOpen: true } },
        });

        const button = dialog.getByRole('button', { name: 'Close' });

        await waitFor(() => expect(button).toBeVisible());

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(replaceImportDialogDidCancel());
    });
});
