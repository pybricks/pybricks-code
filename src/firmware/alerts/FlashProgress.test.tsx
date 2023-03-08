// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import React from 'react';
import { testRender } from '../../../test';
import { flashProgress } from './FlashProgress';

type ActionType = 'erase' | 'flash';

it.each(['erase' as ActionType, 'flash' as ActionType])(
    'should dismiss when close is clicked',
    async (action) => {
        const callback = jest.fn();
        const toast = flashProgress(callback, { action, progress: 0 });

        const [user, message] = testRender(<Toast {...toast} />);

        await user.click(message.getByRole('button', { name: /close/i }));

        expect(callback).toHaveBeenCalledWith('dismiss');
    },
);
