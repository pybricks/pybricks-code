// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

/**
 * Asserts that an assumption is true. This is used to detect programmer errors
 * and should never actually throw in a correctly written program.
 * @param condition A condition that is assumed to be true
 * @param message Informational message for debugging
 */
export function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw Error(message);
    }
}

/**
 * Formats a number as hex (0x00...)
 * @param n The number to format
 * @param pad The total number of digits padded with leading 0s
 */
export function hex(n: number, pad: number): string {
    return `0x${n.toString(16).padStart(pad, '0')}`;
}

/**
 * Looks up a nested property in an object.
 * @param obj The object
 * @param id The property path
 */
export function lookup(obj: object, id: string): string | undefined {
    const value = id
        .split('.')
        .reduce((pv, cv) => pv && (pv as Record<string, object>)[cv], obj);
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}
