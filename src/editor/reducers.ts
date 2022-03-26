// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { editorDidCreate } from './actions';

/** Indicates that the code editor is ready for use. */
const isReady: Reducer<boolean> = (state = false, action) => {
    if (editorDidCreate.matches(action)) {
        return true;
    }

    return state;
};

export default combineReducers({ isReady });
