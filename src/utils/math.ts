// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

/**
 * Compute modulo using floored division
 * @param a first operand
 * @param b second operand
 */
export function fmod(a: number, b: number): number {
    let c = a % b;
    if (c / b < 0) {
        c += b;
    }
    return c;
}

/**
 * Calculates the 32-bit "sum complement" checksum
 * @data an iterable of 32-bit integers
 * @returns the value that needs to be added to get 0
 */
export function sumComplement32(data: Iterable<number>): number {
    let total = 0;
    for (const n of data) {
        total += n;
        total &= ~0;
    }
    // checksum is two's complement of total
    return ~total + 1;
}
