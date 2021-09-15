// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import * as semver from 'semver';

/**
 * Converts a Python short version string (e.g. '1.0.0b1') to a valid semver
 * string (e.g. 1.0.0-beta.1).
 *
 * @param version The Python version string.
 * @returns A modified version string that is a valid semver.
 */
export function pythonVersionToSemver(version: string): string {
    const newVersion = version
        .replace('a', '-alpha.')
        .replace('b', '-beta.')
        .replace('c', '-candidate.')
        .replace('f', '-final.');

    if (!semver.valid(newVersion)) {
        throw new Error('invalid version');
    }

    return newVersion;
}
