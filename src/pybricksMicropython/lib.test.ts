// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import {
    FileNameValidationResult,
    findImportedModules,
    pythonFileExtension,
    pythonFileExtensionRegex,
    validateFileName,
} from './lib';

describe('pythonFileExtensionRegex', () => {
    it.each(['test.py', 'test.PY', 'test.Py', 'test.pY'])(
        'should be case insensitive',
        (testCase) => {
            expect(testCase.match(pythonFileExtensionRegex)).not.toBeNull();
        },
    );

    it('should not match the extension in the middle of a string', () => {
        expect('test.py.test'.match(pythonFileExtensionRegex)).toBeNull();
    });

    it('should only match the extension and not any other part of the string', () => {
        const match = 'test.py'.match(pythonFileExtensionRegex);
        expect(match).toHaveLength(1);
        expect(match).toContain(pythonFileExtension);
    });
});

describe('validateFileName', () => {
    it('should allow file names with underscores', () => {
        expect(validateFileName('file_name', pythonFileExtension, [])).toBe(
            FileNameValidationResult.IsOk,
        );
    });

    it('should not allow file names with dashes', () => {
        expect(validateFileName('file-name', pythonFileExtension, [])).toBe(
            FileNameValidationResult.HasInvalidCharacters,
        );
    });

    it('should not allow empty strings', () => {
        expect(validateFileName('', pythonFileExtension, [])).toBe(
            FileNameValidationResult.IsEmpty,
        );
    });

    it('should not allow file names with spaces', () => {
        expect(validateFileName('file name', pythonFileExtension, [])).toBe(
            FileNameValidationResult.HasSpaces,
        );
    });

    it('should not allow file names that start with numbers', () => {
        expect(validateFileName('1test', pythonFileExtension, [])).toBe(
            FileNameValidationResult.HasInvalidFirstCharacter,
        );
    });

    it('should not allow file names with symbols', () => {
        expect(validateFileName('test$', pythonFileExtension, [])).toBe(
            FileNameValidationResult.HasInvalidCharacters,
        );
    });

    it('it should not allow file names that include the file extension', () => {
        expect(validateFileName('test.py', pythonFileExtension, [])).toBe(
            FileNameValidationResult.HasFileExtension,
        );
    });

    it('should not allow file names that match existing files', () => {
        expect(validateFileName('test', pythonFileExtension, ['test.py'])).toBe(
            FileNameValidationResult.AlreadyExists,
        );
    });
});

test('findImportedModules', async () => {
    const script = `
import a
import b, c
import d.d
import e.e as e
import f.f as f, g
from h import x
from h import x as y
from i import (x, y)
from i import (x as y, z)
from j import *
from . import x
from . import x as y
from .r import x
from ..r import x
from ...r import x
from ....r import x

# import q
# from q import q
"""
import q
from q import q
"""
'''
import q
from q import q
'''
`;

    const modules = findImportedModules(script);

    expect(modules).toEqual(
        new Set([
            'a',
            'b',
            'c',
            'd.d',
            'e.e',
            'f.f',
            'g',
            'h',
            'i',
            'j',
            '.',
            '.r',
            '..r',
            '...r',
            '....r',
        ]),
    );
});
