// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { pythonVersionToSemver } from './version';

describe('pythonVersionToSemver', () => {
    test.each([
        ['v1.0.0', 'v1.0.0'],
        ['v1.0.0a1', 'v1.0.0-alpha.1'],
        ['v1.0.0b2', 'v1.0.0-beta.2'],
        ['v1.0.0c3', 'v1.0.0-candidate.3'],
        ['v1.0.0f4', 'v1.0.0-final.4'],
    ])('valid version %s', (version, expected) => {
        expect(pythonVersionToSemver(version)).toBe(expected);
    });

    test('invalid version', () => {
        expect(() => pythonVersionToSemver('not a version')).toThrow();
    });
});
