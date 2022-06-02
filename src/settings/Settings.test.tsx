// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup, getByLabelText, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import Settings from './Settings';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('showDocs setting switch', () => {
    it('should toggle setting', async () => {
        const [user, settings] = testRender(<Settings />);

        const showDocs = settings.getByLabelText('Documentation');
        expect(showDocs).toBeChecked();

        await user.click(showDocs);
        expect(showDocs).not.toBeChecked();
    });
});

describe('darkMode setting switch', () => {
    it('should toggle setting', async () => {
        const [user, settings] = testRender(<Settings />);

        const darkMode = settings.getByLabelText('Dark mode');
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

describe('flashCurrentProgram setting switch', () => {
    it('should toggle the setting', async () => {
        const [user, settings] = testRender(<Settings />);

        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe(null);

        await user.click(settings.getByLabelText('Include current program'));
        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe('true');

        await user.click(settings.getByLabelText('Include current program'));
        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe('false');
    });
});

describe('hubName setting', () => {
    it('should migrate old settings', () => {
        // old settings did not use json format, so lack quotes
        localStorage.setItem('setting.hubName', 'old name');

        const [, settings] = testRender(<Settings />);

        const textBox = settings.getByLabelText('Hub name');

        expect(textBox).toHaveValue('old name');
    });

    it('should update the setting', async () => {
        const [user, settings] = testRender(<Settings />);

        expect(localStorage.getItem('setting.hubName')).toBe(null);

        const textBox = settings.getByLabelText('Hub name');
        await user.type(textBox, 'test name');

        expect(localStorage.getItem('setting.hubName')).toBe('"test name"');
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
