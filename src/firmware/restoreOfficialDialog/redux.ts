// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createSlice } from '@reduxjs/toolkit';

type State = {
    isOpen: boolean;
};

const initialState: State = {
    isOpen: false,
};

const slice = createSlice({
    name: 'restoreOfficialDialog',
    initialState,
    reducers: {
        show(state) {
            state.isOpen = true;
        },
        hide(state) {
            state.isOpen = false;
        },
    },
});

export const { show, hide } = slice.actions;
export default slice.reducer;
