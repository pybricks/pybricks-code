// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors

import { compile as mpyCrossCompile } from '@pybricks/mpy-cross-v5';
import wasm from '@pybricks/mpy-cross-v5/build/mpy-cross.wasm';
import { call, put, takeEvery } from 'typed-redux-saga/macro';
import { compile, didCompile, didFailToCompile } from './actions';

/**
 * Compiles a script to .mpy and dispatches either didCompile on success or
 * didFailToCompile on error.
 * @param action A mpy compile action.
 */
function* handleCompile(action: ReturnType<typeof compile>): Generator {
    const result = yield* call(() =>
        mpyCrossCompile(
            'main.py',
            action.script,
            action.options,
            // HACK: testing user agent for jsdom is needed only for getting unit tests to work
            navigator.userAgent.includes('jsdom') ? undefined : wasm,
        ),
    );
    if (result.status === 0 && result.mpy) {
        yield* put(didCompile(result.mpy));
    } else {
        yield* put(didFailToCompile(result.err));
    }
}

export default function* (): Generator {
    yield* takeEvery(compile, handleCompile);
}
