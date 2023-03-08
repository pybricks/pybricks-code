// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import React from 'react';
import { testRender } from '../../../test';
import { isLinux, isWindows } from '../../utils/os';
import { noDfuHub } from './NoDfuHub';

jest.mock('../../utils/os');

afterEach(() => {
    jest.restoreAllMocks();
});

it('should dismiss when close is clicked', async () => {
    const callback = jest.fn();
    const toast = noDfuHub(callback, undefined as never);

    const [user, message] = testRender(<Toast {...toast} />);

    await user.click(message.getByRole('button', { name: /close/i }));

    expect(callback).toHaveBeenCalledWith('dismiss');
});

it('should install windows driver when clicked', async () => {
    const callback = jest.fn();
    const toast = noDfuHub(callback, undefined as never);

    jest.mocked(isLinux).mockReturnValue(true);
    jest.mocked(isWindows).mockReturnValue(true);

    const [user, message] = testRender(<Toast {...toast} />);

    await user.click(message.getByRole('button', { name: /driver/i }));

    expect(callback).toHaveBeenCalledWith('installWindowsDriver');
});
