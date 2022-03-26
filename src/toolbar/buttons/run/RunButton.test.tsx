// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import RunButton from './RunButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', () => {
    const [button, dispatch] = testRender(<RunButton />, {
        editor: { isReady: true },
        hub: { runtime: HubRuntimeState.Idle },
    });

    button.getByRole('button', { name: 'Run' }).click();

    expect(dispatch).toHaveBeenCalledWith(downloadAndRun());
});
