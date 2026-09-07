// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2026 The Pybricks Authors

import path from 'path';

const mpyCrossV5Wasm = require.resolve('@pybricks/mpy-cross-v5/build/mpy-cross.wasm');
const mpyCrossV6Wasm = require.resolve(
    '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
);

/**
 * Makes the mpy-cross wasm binaries loadable from tests.
 *
 * HACK: work around Emscripten + Webpack bugs
 * Since we are using jsdom, emscripten thinks we are in a browser and
 * sees that the path starts with file:// but just passes this to
 * path.normalize() which treats file: as a windows-style drive prefix.
 * Also, the webpack import.meta.url doesn't work correctly in the test
 * environment either and returns a path relative to the directory where
 * it was called rather than the node_modules/ directory. So we have to
 * fake the normalization to get the correct path.
 *
 * Call this from `beforeEach()`.
 */
export function mockMpyCrossWasmPath(): void {
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
}

/**
 * The wasm path to pass to `mpyCrossCompileV6()` from tests.
 *
 * This mimics what `new URL('@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
 * import.meta.url)` produces in the app: a file: URL, so that emscripten reads the file
 * instead of trying to fetch it. `mockMpyCrossWasmPath()` rewrites it to the real path.
 */
export const mpyCrossV6WasmPath =
    'file:///@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm';
