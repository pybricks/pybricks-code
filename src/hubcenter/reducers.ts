// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { Reducer, combineReducers } from '@reduxjs/toolkit';
import { hubcenterHideDialog, hubcenterShowDialog } from './actions';

/** A list of open files in the order they should be displayed to the user. */
const showDialog: Reducer<boolean> = (state = false, action) => {
    if (hubcenterShowDialog.matches(action)) {
        return true;
    }

    if (hubcenterHideDialog.matches(action)) {
        return false;
    }

    return state;
};

export default combineReducers({
    showDialog,
});
