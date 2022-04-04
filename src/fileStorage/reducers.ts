// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { fileStorageDidInitialize } from './actions';

const isInitialized: Reducer<boolean> = (state = false, action) => {
    if (fileStorageDidInitialize.matches(action)) {
        return true;
    }

    return state;
};

export default combineReducers({ isInitialized });
