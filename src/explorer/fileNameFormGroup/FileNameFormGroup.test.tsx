// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../test';
import { FileNameValidationResult } from '../../pybricksMicropython/lib';
import FileNameFormGroup from './FileNameFormGroup';

afterEach(() => {
    cleanup();
});

describe('should handle all possible validation results', () => {
    it.each(
        Object.entries(FileNameValidationResult).filter(
            ([, v]) => typeof v === 'number',
        ) as [string, FileNameValidationResult][],
    )('FileNameValidationResult.%s', (_name, result) => {
        testRender(
            <FileNameFormGroup
                fileName="test"
                fileExtension=".file"
                validationResult={result}
                onChange={() => undefined}
            />,
        );
    });
});

it('should fix file names with spaces', async () => {
    const callback = jest.fn();

    const [user, group] = testRender(
        <FileNameFormGroup
            fileName="test name"
            fileExtension=".file"
            validationResult={FileNameValidationResult.HasSpaces}
            onChange={callback}
        />,
    );

    await act(() => user.click(group.getByRole('button', { name: /fix it/i })));

    expect(callback).toHaveBeenCalledWith('test_name');
});

it('should fix file names with file extension', async () => {
    const callback = jest.fn();

    const [user, group] = testRender(
        <FileNameFormGroup
            fileName="test.file"
            fileExtension=".file"
            validationResult={FileNameValidationResult.HasFileExtension}
            onChange={callback}
        />,
    );

    await act(() => user.click(group.getByRole('button', { name: /fix it/i })));

    expect(callback).toHaveBeenCalledWith('test');
});

it('should fix file names with invalid characters', async () => {
    const callback = jest.fn();

    const [user, group] = testRender(
        <FileNameFormGroup
            fileName="test-name"
            fileExtension=".file"
            validationResult={FileNameValidationResult.HasInvalidCharacters}
            onChange={callback}
        />,
    );

    await act(() => user.click(group.getByRole('button', { name: /fix it/i })));

    expect(callback).toHaveBeenCalledWith('test_name');
});
