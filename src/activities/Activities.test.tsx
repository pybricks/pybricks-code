// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import Activities, { Activity } from './Activities';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
});

describe('Activities', () => {
    it('should select explorer by default', () => {
        const [, activities] = testRender(<Activities />);

        const tab = activities.getByRole('tab', { name: 'File Explorer' });

        expect(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should use localStorage for default value', () => {
        localStorage.setItem(
            'activities.selectedActivity',
            JSON.stringify(Activity.Settings),
        );

        const [, activities] = testRender(<Activities />);

        const tab = activities.getByRole('tab', { name: 'Settings & Help' });

        expect(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should select none when clicking already selected tab', async () => {
        const [user, activities] = testRender(<Activities />);

        const explorerTab = activities.getByRole('tab', { name: 'File Explorer' });

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === explorerTab ? 'true' : 'false',
            );
        }

        await user.click(explorerTab);

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute('aria-selected', 'false');
        }
    });

    it('should select new tab when clicking not already selected tab', async () => {
        const [user, activities] = testRender(<Activities />);

        const explorerTab = activities.getByRole('tab', { name: 'File Explorer' });
        const settingsTab = activities.getByRole('tab', { name: 'Settings & Help' });

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === explorerTab ? 'true' : 'false',
            );
        }

        await user.click(settingsTab);

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === settingsTab ? 'true' : 'false',
            );
        }
    });
});
