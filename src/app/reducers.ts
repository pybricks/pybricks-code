// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import { didSucceed, didUpdate } from '../service-worker/actions';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    checkForUpdate,
    didBeforeInstallPrompt,
    didCheckForUpdate,
    didInstall,
    didInstallPrompt,
    installPrompt,
} from './actions';

const serviceWorker: Reducer<ServiceWorkerRegistration | null> = (
    state = null,
    action,
) => {
    if (didSucceed.matches(action)) {
        return action.registration;
    }

    return state;
};

const checkingForUpdate: Reducer<boolean> = (state = false, action) => {
    if (checkForUpdate.matches(action)) {
        return true;
    }

    if (didCheckForUpdate.matches(action)) {
        if (!action.updateFound) {
            return false;
        }
        // otherwise we wait for service worker to download everything
        return state;
    }

    if (didUpdate.matches(action)) {
        return false;
    }

    return state;
};

const updateAvailable: Reducer<boolean> = (state = false, action) => {
    if (didUpdate.matches(action)) {
        return true;
    }

    return state;
};

const beforeInstallPrompt: Reducer<BeforeInstallPromptEvent | null> = (
    state = null,
    action,
) => {
    if (didBeforeInstallPrompt.matches(action)) {
        return action.event;
    }

    if (didInstall.matches(action)) {
        return null;
    }

    return state;
};

const promptingInstall: Reducer<boolean> = (state = false, action) => {
    if (installPrompt.matches(action)) {
        return true;
    }

    if (didInstallPrompt.matches(action)) {
        return false;
    }

    return state;
};

const readyForOfflineUse: Reducer<boolean> = (state = false, action) => {
    if (didSucceed.matches(action)) {
        return true;
    }

    return state;
};

export default combineReducers({
    serviceWorker,
    checkingForUpdate,
    updateAvailable,
    beforeInstallPrompt,
    promptingInstall,
    readyForOfflineUse,
});
