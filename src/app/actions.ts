// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Actions for the app in general.

import { createAction } from '../actions';

/** Action that requests the app to reload. */
export const appReload = createAction(() => ({
    type: 'app.action.reload',
}));

/* Action that requests to check for updates. */
export const appCheckForUpdate = createAction(() => ({
    type: 'app.action.checkForUpdate',
}));

/** Action that indicates that checking for an update has completed. */
export const appDidCheckForUpdate = createAction((updateFound: boolean) => ({
    type: 'app.action.didCheckForUpdate',
    updateFound,
}));

/** Action that indicates that checking for an update failed. */
export const appDidFailToCheckForUpdate = createAction(() => ({
    type: 'app.action.didFailToCheckForUpdate',
}));

/* Action that indicates the browser wants to prompt the use to install the app. */
export const appDidReceiveBeforeInstallPrompt = createAction(() => ({
    type: 'app.action.didBeforeInstallPrompt',
}));

/* Action that requests to prompt the user to install the app. */
export const appShowInstallPrompt = createAction(() => ({
    type: 'app.action.showInstallPrompt',
}));

/* Action that indicates that the user responded to the install prompt. */
export const appDidResolveInstallPrompt = createAction(
    (result: { outcome: 'accepted' | 'dismissed'; platform: string }) => ({
        type: 'app.action.didResolveInstallPrompt',
        result,
    }),
);

/* Action that indicates app was installed. */
export const didInstall = createAction(() => ({
    type: 'app.action.didInstall',
}));
