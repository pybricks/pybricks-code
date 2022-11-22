// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import React from 'react';
import { testRender } from '../../../test';
import { userProgramSize } from './UserProgramSize';

it('should be valid', () => {
    const callback = jest.fn();
    const toast = userProgramSize(callback, { actual: 10000, max: 8000 });

    // TODO: refactor this to a common function to be used by all alerts

    // it should render
    const [, message] = testRender(<>{toast.message}</>);
    expect(message).toBeDefined();

    // it should have a dismiss callback
    toast.onDismiss?.(false);
    expect(callback).toHaveBeenCalledWith('dismiss');
});
