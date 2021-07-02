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
 * Tests if we are running on Windows.
 * @returns `true` if running on Windows, otherwise `false`.
 */
export function isWindows(): boolean {
    return /win/i.test(navigator.platform);
}

/**
 * Tests if the OS is set to dark mode.
 * @returns: `true` if dark mode should be preferred, otherwise `false`.
 */
export function prefersDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
