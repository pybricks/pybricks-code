// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { hex } from '.';

test('hex', () => {
    expect(hex(0, 2)).toBe('0x00');
    expect(hex(1, 4)).toBe('0x0001');
    expect(hex(2, 8)).toBe('0x00000002');
});
