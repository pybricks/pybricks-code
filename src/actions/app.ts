// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: actions/app.ts
// Actions for the app in general.

import { Action } from 'redux';

/** App action types. */
export enum AppActionType {
    /** The app has just ben started. */
    Startup = 'app.action.startup',
    /** Toggle documentation visibility. */
    ToggleDocs = 'app.action.toggleDocs',
}

/** Action that indicates the app has just started. */
export type AppStartupAction = Action<AppActionType.Startup>;

/** Creates an action that indicates the app has just started. */
export function startup(): AppStartupAction {
    return { type: AppActionType.Startup };
}

/** Action to toggle documentation visibility. */
export type AppToggleDocsAction = Action<AppActionType.ToggleDocs>;

/** Creates an action to toggle documentation visibility. */
export function toggleDocs(): AppToggleDocsAction {
    return { type: AppActionType.ToggleDocs };
}

/** common type for all app actions. */
export type AppAction = AppStartupAction | AppToggleDocsAction;
