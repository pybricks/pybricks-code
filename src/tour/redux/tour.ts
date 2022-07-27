// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createSlice } from '@reduxjs/toolkit';

type State = {
    isRunning: boolean;
};

const initialState: State = {
    isRunning: false,
};

const slice = createSlice({
    name: 'tour',
    initialState,
    reducers: {
        start(state) {
            state.isRunning = true;
        },
        stop(state) {
            state.isRunning = false;
        },
    },
});

export const { start, stop } = slice.actions;
export default slice.reducer;
