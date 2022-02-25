// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Actions for the app in general.

import { createAction } from '../actions';
import { BeforeInstallPromptEvent } from '../utils/dom';

/** Creates an action that requests the app to reload. */
export const reload = createAction((registration: ServiceWorkerRegistration) => ({
    type: 'app.action.reload',
    registration,
}));

/** Action that requests to check for updates. */
export const checkForUpdate = createAction(
    (registration: ServiceWorkerRegistration) => ({
        type: 'app.action.checkForUpdate',
        registration,
    }),
);

/** Action that indicates that checking for an update has completed. */
export const didCheckForUpdate = createAction((updateFound: boolean) => ({
    type: 'app.action.didCheckForUpdate',
    updateFound,
}));

/* Action that indicates the browser wants to prompt the use to install the app. */
export const didBeforeInstallPrompt = createAction(
    (event: BeforeInstallPromptEvent) => ({
        type: 'app.action.didBeforeInstallPrompt',
        event,
    }),
);

/* Action that requests to prompt the user to install the app. */
export const installPrompt = createAction((event: BeforeInstallPromptEvent) => ({
    type: 'app.action.installPrompt',
    event,
}));

/* Action that indicates that the user responded to the install prompt. */
export const didInstallPrompt = createAction(() => ({
    type: 'app.action.didInstallPrompt',
}));

/* Action that indicates app was installed. */
export const didInstall = createAction(() => ({
    type: 'app.action.didInstall',
}));

/** Creates an action that indicates the app has just started. */
export const didStart = createAction(() => ({
    type: 'app.action.didStart',
}));
