// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from '@reduxjs/toolkit';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
    firmwareInstallPybricksDialogShow,
} from './actions';

/** Controls the flash Pybricks firmware dialog open state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (firmwareInstallPybricksDialogShow.matches(action)) {
        return true;
    }

    if (firmwareInstallPybricksDialogAccept.matches(action)) {
        return false;
    }

    if (firmwareInstallPybricksDialogCancel.matches(action)) {
        return false;
    }

    return state;
};

export default combineReducers({ isOpen });
