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

    it('should have global keyboard shortcut', async () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        const showDocs = settings.getByLabelText('Documentation');
        expect(showDocs).toBeChecked();

        userEvent.keyboard('{ctrl}d{/ctrl}');

        await waitFor(() => expect(showDocs).not.toBeChecked());
    });
});

describe('about dialog', () => {
    it('should open the dialog when the button is clicked', async () => {
        const [settings] = testRender(
            <SettingsDrawer isOpen={true} onClose={() => undefined} />,
        );

        expect(settings.queryByRole('dialog')).toBeNull();

        settings.getByText('About').click();

        const dialog = settings.getByRole('dialog');

        expect(dialog).toBeVisible();

        getByLabelText(dialog, 'Close').click();

        await waitFor(() => expect(dialog).not.toBeVisible());
    });
});
