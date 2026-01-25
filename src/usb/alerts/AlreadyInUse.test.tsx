// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import { act } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import { alreadyInUse } from './AlreadyInUse';

it('should dismiss when close is clicked', async () => {
    const callback = jest.fn();
    const toast = alreadyInUse(callback, undefined as never);

    const [user, message] = testRender(<Toast {...toast} />);

    await act(() => user.click(message.getByRole('button', { name: /close/i })));

    expect(callback).toHaveBeenCalledWith('dismiss');
});
