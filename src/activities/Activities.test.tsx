// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useIsFirstRender } from 'usehooks-ts';
import { testRender } from '../../test';
import { Activity, useActivities } from './Activities';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
});

type TestActivityProps = {
    expectedActivity: Activity;
};

const TestActivity: React.VoidFunctionComponent<TestActivityProps> = ({
    expectedActivity,
}) => {
    const [selectedActivity, activitiesComponent] = useActivities();

    if (useIsFirstRender()) {
        expect(selectedActivity).toBe(expectedActivity);
    }

    return activitiesComponent;
};

describe('Activities', () => {
    it('should select explorer by default', () => {
        const [activities] = testRender(
            <TestActivity expectedActivity={Activity.Explorer} />,
        );

        const tab = activities.getByRole('tab', { name: 'File Explorer' });

        expect(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should use localStorage for default value', () => {
        localStorage.setItem(
            'activities.selectedActivity',
            JSON.stringify(Activity.Settings),
        );

        const [activities] = testRender(
            <TestActivity expectedActivity={Activity.Settings} />,
        );

        const tab = activities.getByRole('tab', { name: 'Settings & Help' });

        expect(tab).toHaveAttribute('aria-selected', 'true');
    });

    it('should select none when clicking already selected tab', () => {
        const [activities] = testRender(
            <TestActivity expectedActivity={Activity.Explorer} />,
        );

        const explorerTab = activities.getByRole('tab', { name: 'File Explorer' });

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === explorerTab ? 'true' : 'false',
            );
        }

        userEvent.click(explorerTab);

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute('aria-selected', 'false');
        }
    });

    it('should select new tab when clicking not already selected tab', () => {
        const [activities] = testRender(
            <TestActivity expectedActivity={Activity.Explorer} />,
        );

        const explorerTab = activities.getByRole('tab', { name: 'File Explorer' });
        const settingsTab = activities.getByRole('tab', { name: 'Settings & Help' });

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === explorerTab ? 'true' : 'false',
            );
        }

        userEvent.click(settingsTab);

        for (const tab of activities.getAllByRole('tab')) {
            expect(tab).toHaveAttribute(
                'aria-selected',
                tab === settingsTab ? 'true' : 'false',
            );
        }
    });
});
