// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender, uuid } from '../../../../test';
import { FileFormat } from '../../../ble-pybricks-service/protocol';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import RunButton from './RunButton';

afterEach(() => {
    cleanup();
});

test.each([
    [false, false],
    [false, true],
    [true, true],
])(
    'should dispatch action when clicked',
    async (legacyDownload: boolean, legacyStartUserProgram: boolean) => {
        const [user, button, dispatch] = testRender(
            <FocusScope>
                <RunButton id="test-run-button" />
            </FocusScope>,
            {
                editor: { activeFileUuid: uuid(0) },
                hub: {
                    runtime: HubRuntimeState.Idle,
                    preferredFileFormat: FileFormat.MultiMpy6,
                    useLegacyDownload: legacyDownload,
                    useLegacyStartUserProgram: legacyStartUserProgram,
                },
            },
        );

        await act(() => user.click(button.getByRole('button', { name: 'Run' })));

        expect(dispatch).toHaveBeenCalledWith(
            downloadAndRun(
                FileFormat.MultiMpy6,
                legacyDownload,
                legacyStartUserProgram,
                0,
            ),
        );
    },
);
