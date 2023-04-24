// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

import * as semver from 'semver';
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

    test.each([
        ['v1.0.0a1', 'v1.0.0b1'],
        ['v1.0.0b1', 'v1.0.0c1'],
        ['v1.0.0c1', 'v1.0.0'],
    ])('%s < %s', (first, second) => {
        expect(
            semver.lt(pythonVersionToSemver(first), pythonVersionToSemver(second)),
        ).toBeTruthy();
    });

    test('invalid version', () => {
        expect(() => pythonVersionToSemver('not a version')).toThrow();
    });
});
