// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { Reducer, combineReducers } from '@reduxjs/toolkit';
import { bleDidDisconnectPybricks } from '../ble/actions';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { hubcenterHideDialog, hubcenterShowDialog } from './actions';

/** A list of open files in the order they should be displayed to the user. */
const showDialog: Reducer<boolean> = (state = false, action) => {
    if (hubcenterShowDialog.matches(action)) {
        return true;
    }

    if (hubcenterHideDialog.matches(action)) {
        return false;
    }

    if (bleDidDisconnectPybricks.matches(action)) {
        return false;
    }

    if (didReceiveStatusReport.matches(action)) {
        if (action.statusFlags & statusToFlag(Status.Shutdown)) {
            return false;
        }
        if (!(action.statusFlags & statusToFlag(Status.UserProgramRunning))) {
            return false;
        }
    }

    return state;
};

export default combineReducers({
    showDialog,
});
