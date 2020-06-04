// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { CompileResult, compile as mpyCrossCompile } from '@pybricks/mpy-cross-v5';
import { call, put, takeEvery } from 'redux-saga/effects';
import {
    MpyActionType,
    MpyCompileAction,
    didCompile,
    didFailToCompile,
} from '../actions/mpy';

/**
 * Compiles a script to .mpy and dispatches either didCompile on success or
 * didFailToCompile on error.
 * @param action A mpy compile action.
 */
function* compile(action: MpyCompileAction): Generator {
    const result = (yield call(() =>
        mpyCrossCompile('main.py', action.script, action.options),
    )) as CompileResult;
    if (result.status === 0 && result.mpy) {
        yield put(didCompile(result.mpy));
    } else {
        yield put(didFailToCompile(result.err));
    }
}

export default function* (): Generator {
    yield takeEvery(MpyActionType.Compile, compile);
}
