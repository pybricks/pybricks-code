// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Toast } from '@blueprintjs/core';
import React from 'react';
import { testRender, uuid } from '../../../test';
import { editorGoto } from '../../editor/actions';
import { useFileStorageUuid } from '../../fileStorage/hooks';
import { compilerError } from './CompilerError';

afterEach(() => {
    jest.restoreAllMocks();
});

it('should dismiss when close is clicked', async () => {
    const callback = jest.fn();
    const toast = compilerError(callback, { error: ['test'] });

    const [user, message] = testRender(<Toast {...toast} />);

    await user.click(message.getByRole('button', { name: /close/i }));

    expect(callback).toHaveBeenCalledWith('dismiss');
});

it('should dispatch go to error when clicked', async () => {
    const callback = jest.fn();
    const toast = compilerError(callback, {
        error: ['test', '  File "test.py", line 1'],
    });

    jest.mocked(useFileStorageUuid).mockReturnValue(uuid(0));

    const [user, message, dispatch] = testRender(<Toast {...toast} />);

    await user.click(message.getByRole('button', { name: /go to/i }));

    expect(dispatch).toHaveBeenCalledWith(editorGoto(uuid(0), 1));
});
