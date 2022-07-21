// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

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
// thanks https://stackoverflow.com/a/33152544/1976323

const crc32Table: ReadonlyArray<number> = [
    0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9, 0x130476dc, 0x17c56b6b, 0x1a864db2,
    0x1e475005, 0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61, 0x350c9b64, 0x31cd86d3,
    0x3c8ea00a, 0x384fbdbd,
];

/**
 * Calculates the 32-bit CRC32 checksum.
 * @data an iterable of 32-bit integers
 * @returns the checksum
 */
export function crc32(data: Iterable<number>): number {
    let crc = 0xffffffff;

    for (const word of data) {
        crc ^= word;

        for (let i = 0; i < 8; i++) {
            crc = (crc << 4) ^ crc32Table[crc >> 28];
        }
    }

    return crc;
}

/**
 * Calculates the 8-bit "xor" checksum
 * @data an iterable of 8-bit integers
 * @returns all of the values xored together along with 0xff
 */
export function xor8(data: Iterable<number>): number {
    let checksum = 0xff;
    for (const n of data) {
        checksum ^= n & 0xff;
    }
    return checksum;
}
