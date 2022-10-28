// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from '@reduxjs/toolkit';
import { sponsorHideDialog, sponsorShowDialog } from './actions';

/** A list of open files in the order they should be displayed to the user. */
const showDialog: Reducer<boolean> = (state = false, action) => {
    if (sponsorShowDialog.matches(action)) {
        return true;
    }

    if (sponsorHideDialog.matches(action)) {
        return false;
    }

    return state;
};

export default combineReducers({
    showDialog,
});
