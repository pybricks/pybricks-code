// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { hubStartRepl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import ReplButton from './ReplButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(<ReplButton id="test-repl-button" />, {
        hub: { hasRepl: true, runtime: HubRuntimeState.Idle },
    });

    await act(() => user.click(button.getByRole('button', { name: 'REPL' })));

    expect(dispatch).toHaveBeenCalledWith(hubStartRepl(false));
});
