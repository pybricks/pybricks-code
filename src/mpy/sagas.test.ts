// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { compile, didCompile, didFailToCompile } from './actions';
import mpy from './sagas';

enum MpyFeatureFlags {
    MICROPY_OPT_CACHE_MAP_LOOKUP_IN_BYTECODE = 1 << 0,
    MICROPY_PY_BUILTINS_STR_UNICODE = 1 << 1,
}

test('compiler works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('print("hello!")', []));

    const action = await saga.take();
    expect(didCompile.matches(action)).toBeTruthy();
    const { data } = action as ReturnType<typeof didCompile>;
    expect(data[0]).toBe('M'.charCodeAt(0));
    expect(data[1]).toBe(5); // ABI version
    expect(data[2]).toBe(MpyFeatureFlags.MICROPY_PY_BUILTINS_STR_UNICODE);
    expect(data[3]).toBe(31); // small int bits
});

test('compiler error works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('syntax error!', []));

    const action = await saga.take();
    expect(didFailToCompile.matches(action)).toBeTruthy();
    const { err } = action as ReturnType<typeof didFailToCompile>;
    expect(err).toMatchInlineSnapshot(`
        Array [
          "Traceback (most recent call last):",
          "  File \\"main.py\\", line 1",
          "SyntaxError: invalid syntax",
        ]
    `);

    await saga.end();
});
