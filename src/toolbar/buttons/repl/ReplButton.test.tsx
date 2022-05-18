// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { repl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import ReplButton from './ReplButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', () => {
    const [button, dispatch] = testRender(<ReplButton id="test-repl-button" />, {
        hub: { runtime: HubRuntimeState.Idle },
    });

    button.getByRole('button', { name: 'REPL' }).click();

    expect(dispatch).toHaveBeenCalledWith(repl());
});
