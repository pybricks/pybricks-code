// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

/**
 * Asserts that an assumption is true. This is used to detect programmer errors
 * and should never actually throw in a correctly written program.
 * @param condition A condition that is assumed to be true
 * @param message Informational message for debugging
 */
export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw Error(message);
    }
}

/**
 * Asserts that an object is not undefined. This is used to make the type
 * checker happy with `maybe()` and saga `race()` and `all()` effects where
 * we have the condition "if A is undefined, then B is not undefined".
 */
export function defined<T>(obj: T): asserts obj is NonNullable<T> {
    assert(obj !== undefined, 'undefined object');
}

export type Maybe<T> = [T?, Error?];

/** Wraps a promise in try/catch and returns the promise result or error. */
export async function maybe<T>(promise: Promise<T>): Promise<Maybe<T>> {
    try {
        return [await promise];
    } catch (err) {
        return [undefined, ensureError(err)];
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

function isError(err: unknown): err is Error {
    const maybeError = err as Error;

    return (
        maybeError !== undefined &&
        typeof maybeError.name === 'string' &&
        typeof maybeError.message === 'string'
    );
}

export function ensureError(err: unknown): Error {
    if (isError(err)) {
        return err;
    }

    if (typeof err === 'string') {
        return new Error(err);
    }

    return Error(String(err));
}
