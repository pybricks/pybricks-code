// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender, uuid } from '../../../../test';
import { FileFormat } from '../../../ble-pybricks-service/protocol';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import RunButton from './RunButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(<RunButton id="test-run-button" />, {
        editor: { activeFileUuid: uuid(0) },
        hub: {
            runtime: HubRuntimeState.Idle,
            preferredFileFormat: FileFormat.MultiMpy6,
        },
    });

    await act(() => user.click(button.getByRole('button', { name: 'Run' })));

    expect(dispatch).toHaveBeenCalledWith(downloadAndRun(FileFormat.MultiMpy6, false));
});
