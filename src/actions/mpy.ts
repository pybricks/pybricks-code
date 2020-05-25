// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { compile as mpyCrossCompile } from '@pybricks/mpy-cross-v4';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export enum MpyActionType {
    Compiled = 'mpy.action.compile',
}

export interface MpyCompiledAction extends Action<MpyActionType.Compiled> {
    /**
     * The compiled .mpy data.
     */
    data?: Uint8Array;
    /**
     * Error output.
     */
    err?: string;
}

type MpyCompileAction = ThunkAction<Promise<MpyCompiledAction>, {}, {}, Action>;

export function compile(script: string, options?: string[]): MpyCompileAction {
    return async function (): Promise<MpyCompiledAction> {
        const result = await mpyCrossCompile('main.py', script, options);
        return { type: MpyActionType.Compiled, data: result.mpy, err: result.err };
    };
}
