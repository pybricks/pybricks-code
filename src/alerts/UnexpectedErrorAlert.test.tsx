// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import { act } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import { unexpectedError } from './UnexpectedErrorAlert';

it('should dismiss when close is clicked', async () => {
    const callback = jest.fn();
    const toast = unexpectedError(callback, { error: new Error('test') });

    const [user, message] = testRender(<Toast {...toast} />);

    await act(() => user.click(message.getByRole('button', { name: /close/i })));

    expect(callback).toHaveBeenCalledWith('dismiss');
});
