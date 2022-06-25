// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createSlice } from '@reduxjs/toolkit';

export enum CompletionEngineStatus {
    Unknown,
    Loading,
    Ready,
    Failed,
}

type State = {
    status: CompletionEngineStatus;
};

const initialState: State = {
    status: CompletionEngineStatus.Unknown,
};

const slice = createSlice({
    name: 'codeCompletion',
    initialState,
    reducers: {
        init(state) {
            state.status = CompletionEngineStatus.Loading;
        },
        didInit(state) {
            state.status = CompletionEngineStatus.Ready;
        },
        didFailToInit(state) {
            state.status = CompletionEngineStatus.Failed;
        },
    },
});

export const { init, didInit, didFailToInit } = slice.actions;
export default slice.reducer;
