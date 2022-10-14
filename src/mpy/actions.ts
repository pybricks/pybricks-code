// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { createAction } from '../actions';

/** Action that requests that a script is compiled. */
export const compile = createAction(
    (script: string, abiVersion: number, options: string[]) => ({
        type: 'mpy.action.compile',
        script,
        abiVersion,
        options,
    }),
);

export const didCompile = createAction((data: Uint8Array) => ({
    type: 'mpy.action.didCompile',
    data,
}));

export const didFailToCompile = createAction((err: string[]) => ({
    type: 'mpy.action.didFailToCompile',
    err,
}));

export const mpyCompileMulti6 = createAction(() => ({
    type: 'mpy.action.compileMulti6',
}));

export const mpyDidCompileMulti6 = createAction((file: Blob) => ({
    type: 'mpy.action.didCompileMulti6',
    file,
}));

export const mpyDidFailToCompileMulti6 = createAction((error: string[]) => ({
    type: 'mpy.action.didFailToCompileMulti6',
    error,
}));
