// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { fmod, sumComplement32, xor8 } from './math';

describe('fmod', () => {
    test('positive numbers', () => {
        expect(fmod(3, 4)).toBe(3 % 4);
    });

    test('negative and positive number', () => {
        expect(fmod(-3, 4)).toBe(1);
    });
});

describe('sumComplement32', () => {
    test('basic', () => {
        expect(sumComplement32([1, 2, 3, 4, 5])).toBe(-(1 + 2 + 3 + 4 + 5));
    });
    test('overflow', () => {
        expect(sumComplement32([0xffffffff, 0xffffffff])).toBe(-(-1 + -1));
    });
});

describe('xor8', () => {
    test('basic', () => {
        expect(xor8([0])).toBe(0xff);
    });
    test('basic2', () => {
        expect(xor8([0xff, 0xff, 0xff])).toBe(0);
    });
    test('basic3', () => {
        expect(xor8([0xc0, 0x0c])).toBe(0x33);
    });
});
