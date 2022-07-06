// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { compile as mpyCrossCompileV5 } from '@pybricks/mpy-cross-v5';
import wasmV5 from '@pybricks/mpy-cross-v5/build/mpy-cross.wasm';
import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import wasmV6 from '@pybricks/mpy-cross-v6/build/mpy-cross.wasm';
import { call, put, takeEvery } from 'typed-redux-saga/macro';
import { compile, didCompile, didFailToCompile } from './actions';

/**
 * Compiles a script to .mpy and dispatches either didCompile on success or
 * didFailToCompile on error.
 * @param action A mpy compile action.
 */
function* handleCompile(action: ReturnType<typeof compile>): Generator {
    switch (action.abiVersion) {
        case 5:
            {
                const result = yield* call(() =>
                    mpyCrossCompileV5(
                        'main.py',
                        action.script,
                        action.options,
                        // HACK: testing user agent for jsdom is needed only for getting unit tests to work
                        navigator.userAgent.includes('jsdom') ? undefined : wasmV5,
                    ),
                );
                if (result.status === 0 && result.mpy) {
                    yield* put(didCompile(result.mpy));
                } else {
                    yield* put(didFailToCompile(result.err));
                }
            }
            break;

        case 6:
            {
                const result = yield* call(() =>
                    mpyCrossCompileV6(
                        'main.py',
                        action.script,
                        action.options,
                        // HACK: testing user agent for jsdom is needed only for getting unit tests to work
                        navigator.userAgent.includes('jsdom') ? undefined : wasmV6,
                    ),
                );
                if (result.status === 0 && result.mpy) {
                    yield* put(didCompile(result.mpy));
                } else {
                    yield* put(didFailToCompile(result.err));
                }
            }
            break;

        default:
            {
                yield* put(
                    didFailToCompile([
                        `unsupported MPY ABI version: ${action.abiVersion}`,
                    ]),
                );
            }
            break;
    }
}

export default function* (): Generator {
    yield* takeEvery(compile, handleCompile);
}
