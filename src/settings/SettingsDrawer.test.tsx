// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup, getByLabelText, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import SettingsDrawer from './SettingsDrawer';

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('showDocs setting switch', () => {
    it('should toggle setting', async () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        const showDocs = settings.getByLabelText('Documentation');
        expect(showDocs).toBeChecked();

        userEvent.click(showDocs);
        expect(showDocs).not.toBeChecked();
    });
});

describe('darkMode setting switch', () => {
    it('should toggle setting', async () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        const darkMode = settings.getByLabelText('Dark mode');
        expect(darkMode).not.toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe(null);

        userEvent.click(darkMode);
        expect(darkMode).toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe('"dark"');

        userEvent.click(darkMode);
        expect(darkMode).not.toBeChecked();
        expect(localStorage.getItem('usehooks-ts-ternary-dark-mode')).toBe('"light"');
    });
});
describe('flashCurrentProgram setting switch', () => {
    it('should toggle the setting', () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe(null);

        settings.getByLabelText('Include current program').click();
        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe('true');

        settings.getByLabelText('Include current program').click();
        expect(localStorage.getItem('setting.flashCurrentProgram')).toBe('false');
    });
});

describe('hubName setting', () => {
    it('should migrate old settings', () => {
        // old settings did not use json format, so lack quotes
        localStorage.setItem('setting.hubName', 'old name');

        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        const textBox = settings.getByLabelText('Hub name');

        expect(textBox).toHaveValue('old name');
    });

    it('should update the setting', () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        expect(localStorage.getItem('setting.hubName')).toBe(null);

        const textBox = settings.getByLabelText('Hub name');
        userEvent.type(textBox, 'test name');

        expect(localStorage.getItem('setting.hubName')).toBe('"test name"');
    });
});

describe('about dialog', () => {
    it('should open the dialog when the button is clicked', async () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        const appName = process.env.REACT_APP_NAME;

        expect(settings.queryByRole('dialog', { name: `About ${appName}` })).toBeNull();

        settings.getByText('About').click();

        const dialog = settings.getByRole('dialog', { name: `About ${appName}` });

        expect(dialog).toBeVisible();

        getByLabelText(dialog, 'Close').click();

        await waitFor(() => expect(dialog).not.toBeVisible());
    });
});
