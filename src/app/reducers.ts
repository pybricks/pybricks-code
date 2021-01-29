// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Manages state the app in general.

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { ServiceWorkerActionType } from '../service-worker/actions';
import { BeforeInstallPromptEvent } from '../utils/dom';
import { AppActionType } from './actions';

export interface AppState {
    readonly showSettings: boolean;
    readonly showAboutDialog: boolean;
    readonly showLicenseDialog: boolean;
    readonly serviceWorker: ServiceWorkerRegistration | null;
    readonly checkingForUpdate: boolean;
    readonly updateAvailable: boolean;
    readonly beforeInstallPrompt: BeforeInstallPromptEvent;
    readonly promptingInstall: boolean;
    readonly readyForOfflineUse: boolean;
}

const showSettings: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.OpenSettings:
            return true;
        case AppActionType.CloseSettings:
            return false;
        default:
            return state;
    }
};

const showAboutDialog: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.OpenAboutDialog:
            return true;
        case AppActionType.CloseAboutDialog:
            return false;
        default:
            return state;
    }
};

const showLicenseDialog: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.OpenLicenseDialog:
            return true;
        case AppActionType.CloseLicenseDialog:
            return false;
        default:
            return state;
    }
};

const serviceWorker: Reducer<ServiceWorkerRegistration | null, Action> = (
    state = null,
    action,
) => {
    switch (action.type) {
        case ServiceWorkerActionType.DidSucceed:
            return action.registration;
        default:
            return state;
    }
};

const checkingForUpdate: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.CheckForUpdate:
            return true;
        case AppActionType.DidCheckForUpdate:
            if (!action.updateFound) {
                return false;
            }
            // otherwise we wait for service worker to download everything
            return state;
        case ServiceWorkerActionType.DidUpdate:
            return false;
        default:
            return state;
    }
};

const updateAvailable: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case ServiceWorkerActionType.DidUpdate:
            return true;
        default:
            return state;
    }
};

const beforeInstallPrompt: Reducer<BeforeInstallPromptEvent | null, Action> = (
    state = null,
    action,
) => {
    switch (action.type) {
        case AppActionType.DidBeforeInstallPrompt:
            return action.event;
        case AppActionType.DidInstall:
            return null;
        default:
            return state;
    }
};

const promptingInstall: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case AppActionType.InstallPrompt:
            return true;
        case AppActionType.DidInstallPrompt:
            return false;
        default:
            return state;
    }
};

const readyForOfflineUse: Reducer<boolean, Action> = (state = false, action) => {
    switch (action.type) {
        case ServiceWorkerActionType.DidSucceed:
            return true;
        default:
            return state;
    }
};

export default combineReducers({
    showSettings,
    showAboutDialog,
    showLicenseDialog,
    serviceWorker,
    checkingForUpdate,
    updateAvailable,
    beforeInstallPrompt,
    promptingInstall,
    readyForOfflineUse,
});
