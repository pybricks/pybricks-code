// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { assert, hex, maybe } from '.';

test('assert', () => {
    const assertTrue = jest.fn(() => assert(true, 'should not throw'));
    assertTrue();
    expect(assertTrue).toHaveReturned();

    expect(() => assert(false, 'should throw')).toThrow();
});

describe('maybe', () => {
    test('resolved', async () => {
        const result = await maybe(Promise.resolve('test'));
        expect(result).toBe('test');
    });
    test('rejected', async () => {
        const result = await maybe(Promise.reject(new Error('test')));
        expect(result).toBeInstanceOf(Error);
    });
});

test('hex', () => {
    expect(hex(0, 2)).toBe('0x00');
    expect(hex(1, 4)).toBe('0x0001');
    expect(hex(2, 8)).toBe('0x00000002');
});
