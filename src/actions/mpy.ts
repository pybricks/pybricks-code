// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum MpyActionType {
    Compile = 'mpy.action.compile',
    DidCompile = 'mpy.action.didCompile',
    DidFailToCompile = 'mpy.action.didFailToCompile',
}

/** Action that requests that a script is compiled. */
export type MpyCompileAction = Action<MpyActionType.Compile> & {
    /** The script to compile. */
    readonly script: string;
    /** The compiler command line options */
    options?: string[];
};

export function compile(script: string, options?: string[]): MpyCompileAction {
    return { type: MpyActionType.Compile, script, options };
}

export type MpyDidCompileAction = Action<MpyActionType.DidCompile> & {
    /** The compiled .mpy file. */
    readonly data: Uint8Array;
};

export function didCompile(data: Uint8Array): MpyDidCompileAction {
    return { type: MpyActionType.DidCompile, data };
}

export type MpyDidFailToCompileAction = Action<MpyActionType.DidFailToCompile> & {
    /** Error output. */
    readonly err: string;
};

export function didFailToCompile(err: string): MpyDidFailToCompileAction {
    return { type: MpyActionType.DidFailToCompile, err };
}

/** Common type for all mpy actions. */
export type MpyAction =
    | MpyCompileAction
    | MpyDidCompileAction
    | MpyDidFailToCompileAction;
