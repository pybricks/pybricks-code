// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { getByLabelText, waitFor } from '@testing-library/dom';
import React from 'react';
import { testRender } from '../../test';
import Toolbar from './Toolbar';

describe('settings button', () => {
    it('should open settings drawer', async () => {
        const [toolbar] = testRender(<Toolbar />);

        const settingButton = toolbar.getByLabelText('Settings');

        expect(
            toolbar.queryByRole('dialog', {
                name: 'Settings & Help',
            }),
        ).toBeNull();

        settingButton.click();

        const settingsDrawer = toolbar.getByRole('dialog', {
            name: 'Settings & Help',
        });

        expect(settingsDrawer).toBeVisible();

        getByLabelText(settingsDrawer, 'Close').click();

        await waitFor(() => expect(settingsDrawer).not.toBeVisible());
    });
});
