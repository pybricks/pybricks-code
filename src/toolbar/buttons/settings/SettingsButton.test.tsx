// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import SettingsButton from './SettingsButton';

afterEach(() => {
    cleanup();
});

it('should invoke callback when clicked', () => {
    const handleAction = jest.fn();

    const [button] = testRender(<SettingsButton onAction={handleAction} />);

    button.getByRole('button', { name: 'Settings' }).click();

    expect(handleAction).toHaveBeenCalled();
});
