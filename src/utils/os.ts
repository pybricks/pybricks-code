// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Utility functions for dealing with operating systems.

/**
 * Tests if we are running on Android.
 * @returns `true` if running on Android, otherwise `false`.
 */
export function isAndroid(): boolean {
    return navigator.userAgentData?.platform === 'Android';
}

/**
 * Tests if we are running on macOS.
 * @returns `true` if running on macOS, otherwise `false`.
 */
export function isMacOS(): boolean {
    return navigator.userAgentData?.platform === 'macOS';
}

/**
 * Tests if we are running on Windows.
 * @returns `true` if running on Windows, otherwise `false`.
 */
export function isWindows(): boolean {
    return navigator.userAgentData?.platform === 'Windows';
}

/**
 * Tests if we are running on Linux.
 * @returns `true` if running on Linux, otherwise `false`.
 */
export function isLinux(): boolean {
    return navigator.userAgentData?.platform === 'Linux';
}

/**
 * Tests if we are running on iOS.
 * @returns `true` if running on iOS, otherwise `false`.
 */
export function isIOS(): boolean {
    return navigator.userAgentData?.platform === 'iOS';
}
