// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Utility functions for dealing with operating systems.

export function isMacOS(): boolean {
    return /mac/i.test(navigator.platform);
}
