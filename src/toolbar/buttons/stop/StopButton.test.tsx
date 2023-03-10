// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { stop } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import StopButton from './StopButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(<StopButton id="test-stop-button" />, {
        hub: { runtime: HubRuntimeState.Running },
    });

    await act(() => user.click(button.getByRole('button', { name: 'Stop' })));

    expect(dispatch).toHaveBeenCalledWith(stop());
});
