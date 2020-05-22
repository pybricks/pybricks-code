// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { count, createCountFunc } from './iter';

test('count', () => {
    let expected = 0;
    for (const i of count()) {
        expect(i).toBe(expected);
        expected++;
        if (expected > 10) {
            break;
        }
    }
});

test('createCountFunc', () => {
    const func = createCountFunc();
    expect(func()).toBe(0);
    expect(func()).toBe(1);
    expect(func()).toBe(2);
    expect(func()).toBe(3);
    expect(func()).toBe(4);
    expect(func()).toBe(5);
    expect(func()).toBe(6);
    expect(func()).toBe(7);
    expect(func()).toBe(8);
    expect(func()).toBe(9);
});
