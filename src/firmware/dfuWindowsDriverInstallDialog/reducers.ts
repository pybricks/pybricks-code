// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from '@reduxjs/toolkit';
import {
    firmwareDfuWindowsDriverInstallDialogDialogHide,
    firmwareDfuWindowsDriverInstallDialogDialogShow,
} from './actions';

/** Controls the flash Pybricks firmware dialog open state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (firmwareDfuWindowsDriverInstallDialogDialogShow.matches(action)) {
        return true;
    }

    if (firmwareDfuWindowsDriverInstallDialogDialogHide.matches(action)) {
        return false;
    }

    return state;
};

export default combineReducers({ isOpen });
