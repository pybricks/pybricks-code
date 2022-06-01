// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
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
