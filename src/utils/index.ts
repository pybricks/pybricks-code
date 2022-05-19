// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

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
    assert(obj !== null, 'null object');
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

/**
 * Gets a timestamp with second resolution suitable for use in a filename.
 */
export function timestamp(): string {
    return new Date()
        .toISOString()
        .replace('T', '_')
        .replaceAll(':', '-')
        .replace(/\..*$/, '');
}

/**
 * Helper function to wrap navigator.locks in a promise so that it can be used
 * in code where using it natively doesn't work well (e.g. in sagas). Care must
 * be taken so that all code paths (including exceptions) release the lock.
 *
 * To release the lock, await the returned release function. When the release
 * function resolves, the lock will no longer be held.
 *
 * @param name The name of the lock.
 * @param shared If true, the lock will be share (e.g. for reading), otherwise
 * the lock will be exclusive (e.g. for writing).
 * @returns A release function if the lock was acquired or nothing if the lock
 * was already held exclusively by someone else.
 */
export async function acquireLock(
    name: string,
    shared?: boolean,
): Promise<(() => Promise<void>) | void> {
    let lockWaiter: Promise<void>;

    const release = await new Promise<(() => void) | void>((resolve, reject) => {
        lockWaiter = navigator.locks
            .request(
                name,
                {
                    ifAvailable: true,
                    mode: shared ? 'shared' : 'exclusive',
                },
                (lock) => {
                    // if the locks is already held, lock will be null here
                    if (lock === null) {
                        resolve();
                        return;
                    }

                    // Now we own the lock and it will be held until the returned
                    // promise is resolved.
                    return new Promise<void>((resolve2) => resolve(resolve2));
                },
            )
            .catch(reject);
    });

    if (!release) {
        return;
    }

    return async () => {
        // trigger the release
        release();
        // then wait until the release is complete and the lock is no longer held
        await lockWaiter;
    };
}
