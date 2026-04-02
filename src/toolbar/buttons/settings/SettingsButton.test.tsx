// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender } from '../../../../test';
import { Activity } from '../../../activities/hooks';
import SettingsButton from './SettingsButton';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

const settingsButtonId = 'test-settings-button';

it('should open settings activity when clicked', async () => {
    sessionStorage.setItem(
        'activities.selectedActivity',
        JSON.stringify(Activity.None),
    );

    const [user, button] = testRender(
        <FocusScope>
            <SettingsButton id={settingsButtonId} />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'Settings' })));

    expect(sessionStorage.getItem('activities.selectedActivity')).toBe(
        JSON.stringify(Activity.Settings),
    );
});

it('should close settings activity when clicked while already active', async () => {
    sessionStorage.setItem(
        'activities.selectedActivity',
        JSON.stringify(Activity.Settings),
    );

    const [user, button] = testRender(
        <FocusScope>
            <SettingsButton id={settingsButtonId} />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'Settings' })));

    expect(sessionStorage.getItem('activities.selectedActivity')).toBe(
        JSON.stringify(Activity.None),
    );
});
