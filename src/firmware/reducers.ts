// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2026 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    didFailToFinish,
    didFinish,
    didStart,
    firmwareDidFailToFlashUsbDfu,
    firmwareDidFailToRestoreOfficialDfu,
    firmwareDidFailToRestoreOfficialEV3,
    firmwareDidFlashUsbDfu,
    firmwareDidRestoreOfficialDfu,
    firmwareDidRestoreOfficialEV3,
    firmwareFlashUsbDfu,
    firmwareRestoreOfficialDfu,
    firmwareRestoreOfficialEV3,
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

const isFirmwareFlashEV3InProgress: Reducer<boolean> = (state = false, action) => {
    if (firmwareRestoreOfficialEV3.matches(action)) {
        return true;
    }

    if (firmwareDidRestoreOfficialEV3.matches(action)) {
        return false;
    }

    if (firmwareDidFailToRestoreOfficialEV3.matches(action)) {
        return false;
    }
    return state;
};

export default combineReducers({
    dfuWindowsDriverInstallDialog,
    installPybricksDialog,
    restoreOfficialDialog,
    flashing,
    isFirmwareFlashUsbDfuInProgress,
    isFirmwareRestoreOfficialDfuInProgress,
    isFirmwareFlashEV3InProgress,
});
