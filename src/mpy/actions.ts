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
