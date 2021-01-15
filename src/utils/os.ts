// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Utility functions for dealing with operating systems.

/**
 * Tests if we are running on macOS.
 * @returns `true` if running on macOS, otherwise `false`.
 */
export function isMacOS(): boolean {
    return /mac/i.test(navigator.platform);
}

/**
 * Tests if the OS is set to dark mode.
 * @returns: `true` if dark mode should be preferred, otherwise `false`.
 */
export function prefersDarkMode(): boolean {
    if (!window.matchMedia) {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
