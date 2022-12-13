// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup, getByLabelText, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import { firmwareInstallPybricks } from '../firmware/actions';
import { firmwareRestoreOfficialDialogShow } from '../firmware/restoreOfficialDialog/actions';
import Settings from './Settings';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

describe('darkMode setting switch', () => {
    it('should toggle setting', async () => {
        const [user, settings] = testRender(<Settings />);

        const darkMode = settings.getByLabelText('Dark Mode');
        expect(darkMode).not.toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe(null);

        await user.click(darkMode);
        expect(darkMode).toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe('"dark"');

        await user.click(darkMode);
        expect(darkMode).not.toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe('"light"');
    });
});

describe('firmware', () => {
    it('should dispatch action when install Pybricks firmware button is clicked', async () => {
        const [user, settings, dispatch] = testRender(<Settings />);

        const button = settings.getByRole('button', {
            name: 'Install Pybricks Firmware',
        });
        await user.click(button);

        expect(dispatch).toHaveBeenCalledWith(firmwareInstallPybricks());
    });

    it('should dispatch action when restore official LEGO firmware button is clicked', async () => {
        const [user, settings, dispatch] = testRender(<Settings />);

        const button = settings.getByRole('button', {
            name: 'Restore Official LEGO® Firmware',
        });
        await user.click(button);

        expect(dispatch).toHaveBeenCalledWith(firmwareRestoreOfficialDialogShow());
    });
});

describe('about dialog', () => {
    it('should open the dialog when the button is clicked', async () => {
        const [user, settings] = testRender(<Settings />);

        const appName = process.env.REACT_APP_NAME;

        expect(settings.queryByRole('dialog', { name: `About ${appName}` })).toBeNull();

        await user.click(settings.getByText('About'));

        const dialog = settings.getByRole('dialog', { name: `About ${appName}` });

        expect(dialog).toBeVisible();

        await user.click(getByLabelText(dialog, 'Close'));

        await waitFor(() => expect(dialog).not.toBeVisible());
    });
});
