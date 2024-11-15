// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender } from '../../../../test';
import { hubStartRepl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import ReplButton from './ReplButton';

afterEach(() => {
    cleanup();
});

test.each([[false, false, false, true, true, true]])(
    'should dispatch action when clicked',
    async (legacyDownload: boolean, legacyStartUserProgram: boolean) => {
        const [user, button, dispatch] = testRender(
            <FocusScope>
                <ReplButton id="test-repl-button" />
            </FocusScope>,
            {
                hub: {
                    hasRepl: true,
                    runtime: HubRuntimeState.Idle,
                    useLegacyDownload: legacyDownload,
                    useLegacyStartUserProgram: legacyStartUserProgram,
                },
            },
        );

        await act(() => user.click(button.getByRole('button', { name: 'REPL' })));

        expect(dispatch).toHaveBeenCalledWith(
            hubStartRepl(legacyDownload, legacyStartUserProgram),
        );
    },
);
