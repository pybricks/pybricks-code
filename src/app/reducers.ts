// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import {
    appCheckForUpdate,
    appDidCheckForUpdate,
    appDidReceiveBeforeInstallPrompt,
    appDidResolveInstallPrompt,
    appShowInstallPrompt,
    didInstall,
} from './actions';

/** Indicates that the service worker was successfully registered. */
const isServiceWorkerRegistered: Reducer<boolean> = (state = false, action) => {
    if (serviceWorkerDidSucceed.matches(action)) {
        return true;
    }

    return state;
};

const checkingForUpdate: Reducer<boolean> = (state = false, action) => {
    if (appCheckForUpdate.matches(action)) {
        return true;
    }

    if (appDidCheckForUpdate.matches(action)) {
        if (!action.updateFound) {
            return false;
        }
        // otherwise we wait for service worker to download everything
        return state;
    }

    if (serviceWorkerDidUpdate.matches(action)) {
        return false;
    }

    return state;
};

const updateAvailable: Reducer<boolean> = (state = false, action) => {
    if (serviceWorkerDidUpdate.matches(action)) {
        return true;
    }

    return state;
};

/**
 * Indicates that the app has received the BeforeInstallPromptEvent but the
 * app has not been installed yet.
 */
const hasUnresolvedInstallPrompt: Reducer<boolean> = (state = false, action) => {
    if (appDidReceiveBeforeInstallPrompt.matches(action)) {
        return true;
    }

    if (didInstall.matches(action)) {
        return false;
    }

    return state;
};

/** Indicates that the browser install prompt is active. */
const promptingInstall: Reducer<boolean> = (state = false, action) => {
    if (appShowInstallPrompt.matches(action)) {
        return true;
    }

    if (appDidResolveInstallPrompt.matches(action)) {
        return false;
    }

    return state;
};

const readyForOfflineUse: Reducer<boolean> = (state = false, action) => {
    if (serviceWorkerDidSucceed.matches(action)) {
        return true;
    }

    return state;
};

export default combineReducers({
    isServiceWorkerRegistered,
    checkingForUpdate,
    updateAvailable,
    hasUnresolvedInstallPrompt,
    promptingInstall,
    readyForOfflineUse,
});
