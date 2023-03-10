// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import { Hub } from '../../components/hubPicker';
import { firmwareRestoreOfficialDfu } from '../actions';
import RestoreOfficialDialog from './RestoreOfficialDialog';
import { firmwareRestoreOfficialDialogHide } from './actions';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
});

describe('closing', () => {
    it('should close when close button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RestoreOfficialDialog />, {
            firmware: { restoreOfficialDialog: { isOpen: true } },
        });

        await act(() => user.click(dialog.getByRole('button', { name: 'Close' })));

        expect(dispatch).toHaveBeenCalledWith(firmwareRestoreOfficialDialogHide());
    });

    it('should close when done button is clicked', async () => {
        const [user, dialog, dispatch] = testRender(<RestoreOfficialDialog />, {
            firmware: { restoreOfficialDialog: { isOpen: true } },
        });

        await act(() => user.click(dialog.getByRole('button', { name: 'Next' })));
        await act(() => user.click(dialog.getByRole('button', { name: 'Done' })));

        expect(dispatch).toHaveBeenCalledWith(firmwareRestoreOfficialDialogHide());
    });
});

describe('flashing', () => {
    it.each([
        ['SPIKE Prime Hub', Hub.Prime],
        ['SPIKE Essential Hub', Hub.Essential],
        ['MINDSTORMS Robot Inventor Hub', Hub.Inventor],
    ])(
        'should flash %s when flash button is clicked',
        async (hubName: string, hub: Hub) => {
            const [user, dialog, dispatch] = testRender(<RestoreOfficialDialog />, {
                firmware: { restoreOfficialDialog: { isOpen: true } },
            });

            await act(() => user.click(dialog.getByRole('radio', { name: hubName })));
            await act(() => user.click(dialog.getByRole('button', { name: 'Next' })));
            await act(() =>
                user.click(dialog.getByRole('button', { name: 'Restore' })),
            );

            expect(dispatch).toHaveBeenCalledWith(firmwareRestoreOfficialDfu(hub));
        },
    );
});
