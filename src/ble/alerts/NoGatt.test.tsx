// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import { act } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import { noGatt } from './NoGatt';

it('should dismiss when close is clicked', async () => {
    const callback = jest.fn();
    const toast = noGatt(callback, undefined as never);

    const [user, message] = testRender(<Toast {...toast} />);

    await act(() => user.click(message.getByRole('button', { name: /close/i })));

    expect(callback).toHaveBeenCalledWith('dismiss');
});
