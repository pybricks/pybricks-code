// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import path from 'path';
import { AsyncSaga } from '../../test';
import { compile, didCompile, didFailToCompile } from './actions';
import mpy from './sagas';

const mpyCrossV5Wasm = require.resolve('@pybricks/mpy-cross-v5/build/mpy-cross.wasm');
const mpyCrossV6Wasm = require.resolve(
    '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
);

beforeEach(() => {
    // HACK: work around Emscripten + Webpack bugs
    // Since we are using jsdom, emscripten thinks we are in a browser and
    // sees that the path starts with file:// but just passes this to
    // path.normalize() which treats file: as a windows-style drive prefix.
    // Also, the webpack import.meta.url doesn't work correctly in the test
    // environment either and returns a path relative to the directory where
    // it was called rather than the node_modules/ directory. So we have to
    // fake the normalization to get the correct path.
    jest.spyOn(path, 'normalize').mockImplementation((p) => {
        // NB: we can't call require.resolve() here because it would recursively
        // call this function via path.normalize()!
        if (p.endsWith('@pybricks/mpy-cross-v5/build/mpy-cross.wasm')) {
            return mpyCrossV5Wasm;
        }

        if (p.endsWith('@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm')) {
            return mpyCrossV6Wasm;
        }

        return p;
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

test('compiler works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('print("hello!")', 6, []));

    const action = await saga.take();
    expect(didCompile.matches(action)).toBeTruthy();
    const { data } = action as ReturnType<typeof didCompile>;
    expect(data[0]).toBe('M'.charCodeAt(0));
    expect(data[1]).toBe(6); // ABI version
    expect(data[2]).toBe(0); // flags
    expect(data[3]).toBe(31); // small int bits
});

test('compiler error works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('syntax error!', 6, []));

    const action = await saga.take();
    expect(didFailToCompile.matches(action)).toBeTruthy();
    const { err } = action as ReturnType<typeof didFailToCompile>;
    expect(err).toMatchInlineSnapshot(`
        [
          "Traceback (most recent call last):",
          "  File "main.py", line 1",
          "SyntaxError: invalid syntax",
        ]
    `);

    await saga.end();
});
