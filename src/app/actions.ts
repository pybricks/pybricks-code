// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Actions for the app in general.

import { Action } from 'redux';
import { BeforeInstallPromptEvent } from '../utils/dom';

/** App action types. */
export enum AppActionType {
    /** Reload the app. */
    Reload = 'app.action.reload',
    /** Checks for an available update. */
    CheckForUpdate = 'app.action.checkForUpdate',
    /** Indicates that checking for update finished. */
    DidCheckForUpdate = 'app.action.didCheckForUpdate',
    /* Indicates the browser wants to prompt the use to install the app. */
    DidBeforeInstallPrompt = 'app.action.didBeforeInstallPrompt',
    /* Requests to prompt the user to install the app. */
    InstallPrompt = 'app.action.installPrompt',
    /* Indicates that the user responded to the install prompt. */
    DidInstallPrompt = 'app.action.didInstallPrompt',
    /* Indicates that the app was installed. */
    DidInstall = 'app.action.didInstallPrompt',
    /** The app has just ben started. */
    DidStart = 'app.action.didStart',
}

/** Action that requests the app to reload. */
export type AppReloadAction = Action<AppActionType.Reload> & {
    registration: ServiceWorkerRegistration;
};

/** Creates an action that requests the app to reload. */
export function reload(registration: ServiceWorkerRegistration): AppReloadAction {
    return { type: AppActionType.Reload, registration };
}

/** Action that requests to check for updates. */
export type AppCheckForUpdatesAction = Action<AppActionType.CheckForUpdate> & {
    registration: ServiceWorkerRegistration;
};

/** Action that requests to check for updates. */
export function checkForUpdate(
    registration: ServiceWorkerRegistration,
): AppCheckForUpdatesAction {
    return { type: AppActionType.CheckForUpdate, registration };
}

/** Action that indicates that checking for an update has completed. */
export type AppDidCheckForUpdateAction = Action<AppActionType.DidCheckForUpdate> & {
    updateFound: boolean;
};

/** Action that indicates that checking for an update has completed. */
export function didCheckForUpdate(updateFound: boolean): AppDidCheckForUpdateAction {
    return { type: AppActionType.DidCheckForUpdate, updateFound };
}

/* Action that indicates the browser wants to prompt the use to install the app. */
export type AppDidBeforeInstallPromptAction =
    Action<AppActionType.DidBeforeInstallPrompt> & {
        event: BeforeInstallPromptEvent;
    };

/* Action that indicates the browser wants to prompt the use to install the app. */
export function didBeforeInstallPrompt(
    event: BeforeInstallPromptEvent,
): AppDidBeforeInstallPromptAction {
    return { type: AppActionType.DidBeforeInstallPrompt, event };
}

/* Action that requests to prompt the user to install the app. */
export type AppInstallPromptAction = Action<AppActionType.InstallPrompt> & {
    event: BeforeInstallPromptEvent;
};

/* Action that requests to prompt the user to install the app. */
export function installPrompt(event: BeforeInstallPromptEvent): AppInstallPromptAction {
    return { type: AppActionType.InstallPrompt, event };
}

/* Action that indicates that the user responded to the install prompt. */
export type AppDidInstallPromptAction = Action<AppActionType.DidInstallPrompt>;

/* Action that indicates that the user responded to the install prompt. */
export function didInstallPrompt(): AppDidInstallPromptAction {
    return { type: AppActionType.DidInstallPrompt };
}

/* Action that indicates app was installed. */
export type AppDidInstallAction = Action<AppActionType.DidInstall>;

/* Action that indicates app was installed. */
export function didInstall(): AppDidInstallAction {
    return { type: AppActionType.DidInstall };
}

/** Action that indicates the app has just started. */
export type AppDidStartAction = Action<AppActionType.DidStart>;

/** Creates an action that indicates the app has just started. */
export function didStart(): AppDidStartAction {
    return { type: AppActionType.DidStart };
}

/** common type for all app actions. */
export type AppAction =
    | AppReloadAction
    | AppCheckForUpdatesAction
    | AppDidCheckForUpdateAction
    | AppDidBeforeInstallPromptAction
    | AppInstallPromptAction
    | AppDidInstallPromptAction
    | AppDidInstallAction
    | AppDidStartAction;
