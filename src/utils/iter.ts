// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

/**
 * Creates an iterator that counts infinitely (to Number.MAX_SAFE_INTEGER really)
 * starting from 0.
 */
export function* count(): Generator<number, number, void> {
    let n = 0;
    while (true) {
        yield n++;
    }
}

/**
 * Creates a new function that counts infinitely (to Number.MAX_SAFE_INTEGER really)
 * starting from 0.
 */
export function createCountFunc(): () => number {
    const gen = count();
    return (): number => gen.next().value;
}
