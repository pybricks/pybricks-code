// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
    firmwareDidFailToFlashUsbDfu,
    firmwareDidFailToRestoreOfficialDfu,
    firmwareDidFlashUsbDfu,
    firmwareDidRestoreOfficialDfu,
    firmwareFlashUsbDfu,
    firmwareRestoreOfficialDfu,
} from './actions';
import dfuWindowsDriverInstallDialog from './dfuWindowsDriverInstallDialog/reducers';
import installPybricksDialog from './installPybricksDialog/reducers';
import restoreOfficialDialog from './restoreOfficialDialog/reducers';

const flashing: Reducer<boolean> = (state = false, action) => {
    if (didStart.matches(action)) {
        return true;
    }

    if (didFinish.matches(action) || didFailToFinish.matches(action)) {
        return false;
    }

    return state;
};

const progress: Reducer<number | null> = (state = null, action) => {
    if (didStart.matches(action)) {
        return null;
    }

    if (didProgress.matches(action)) {
        return action.value;
    }

    return state;
};

const isFirmwareFlashUsbDfuInProgress: Reducer<boolean> = (state = false, action) => {
    if (firmwareFlashUsbDfu.matches(action)) {
        return true;
    }

    if (firmwareDidFlashUsbDfu.matches(action)) {
        return false;
    }

    if (firmwareDidFailToFlashUsbDfu.matches(action)) {
        return false;
    }

    return state;
};

const isFirmwareRestoreOfficialDfuInProgress: Reducer<boolean> = (
    state = false,
    action,
) => {
    if (firmwareRestoreOfficialDfu.matches(action)) {
        return true;
    }

    if (firmwareDidRestoreOfficialDfu.matches(action)) {
        return false;
    }

    if (firmwareDidFailToRestoreOfficialDfu.matches(action)) {
        return false;
    }

    return state;
};

export default combineReducers({
    dfuWindowsDriverInstallDialog,
    installPybricksDialog,
    restoreOfficialDialog,
    flashing,
    progress,
    isFirmwareFlashUsbDfuInProgress,
    isFirmwareRestoreOfficialDfuInProgress,
});
