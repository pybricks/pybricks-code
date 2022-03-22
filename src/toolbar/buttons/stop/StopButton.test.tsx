// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { stop } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import StopButton from './StopButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', () => {
    const [button, dispatch] = testRender(<StopButton />, {
        hub: { runtime: HubRuntimeState.Running },
    });

    button.getByRole('button', { name: 'Stop' }).click();

    expect(dispatch).toHaveBeenCalledWith(stop());
});
