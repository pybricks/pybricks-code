// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender } from '../../../../test';
import { Activity } from '../../../activities/hooks';
import ExplorerButton from './ExplorerButton';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

const explorerButtonId = 'test-explorer-button';

it('should open explorer activity when clicked', async () => {
    sessionStorage.setItem(
        'activities.selectedActivity',
        JSON.stringify(Activity.None),
    );

    const [user, button] = testRender(
        <FocusScope>
            <ExplorerButton id={explorerButtonId} />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'File Explorer' })));

    expect(sessionStorage.getItem('activities.selectedActivity')).toBe(
        JSON.stringify(Activity.Explorer),
    );
});

it('should close explorer activity when clicked while already active', async () => {
    sessionStorage.setItem(
        'activities.selectedActivity',
        JSON.stringify(Activity.Explorer),
    );

    const [user, button] = testRender(
        <FocusScope>
            <ExplorerButton id={explorerButtonId} />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'File Explorer' })));

    expect(sessionStorage.getItem('activities.selectedActivity')).toBe(
        JSON.stringify(Activity.None),
    );
});
