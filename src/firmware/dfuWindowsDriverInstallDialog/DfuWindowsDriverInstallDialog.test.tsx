// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import DfuWindowsDriverInstallDialog from './DfuWindowsDriverInstallDialog';
import { firmwareDfuWindowsDriverInstallDialogDialogHide } from './actions';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

it('should dispatch action when the close button is pressed', async () => {
    const [user, dialog, dispatch] = testRender(<DfuWindowsDriverInstallDialog />, {
        firmware: { dfuWindowsDriverInstallDialog: { isOpen: true } },
    });

    await act(() => user.click(dialog.getByRole('button', { name: 'Close' })));

    expect(dispatch).toHaveBeenCalledWith(
        firmwareDfuWindowsDriverInstallDialogDialogHide(),
    );
});

it('should navigate when next button is pressed and dispatch action when the done button is pressed', async () => {
    const [user, dialog, dispatch] = testRender(<DfuWindowsDriverInstallDialog />, {
        firmware: { dfuWindowsDriverInstallDialog: { isOpen: true } },
    });

    for (let i = 1; i < 9; i++) {
        await act(() => user.click(dialog.getByRole('button', { name: 'Next' })));
    }

    await act(() => user.click(dialog.getByRole('button', { name: 'Done' })));

    expect(dispatch).toHaveBeenCalledWith(
        firmwareDfuWindowsDriverInstallDialogDialogHide(),
    );
});
