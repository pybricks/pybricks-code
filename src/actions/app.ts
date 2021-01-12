// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: actions/app.ts
// Actions for the app in general.

import { Action } from 'redux';

/** App action types. */
export enum AppActionType {
    /** The app has just ben started. */
    Startup = 'app.action.startup',
    /** Open settings dialog. */
    OpenSettings = 'app.action.openSettings',
    /** Close settings dialog. */
    CloseSettings = 'app.action.closeSettings',
    /** Toggle documentation visibility. */
    ToggleDocs = 'app.action.toggleDocs',
}

/** Action that indicates the app has just started. */
export type AppStartupAction = Action<AppActionType.Startup>;

/** Creates an action that indicates the app has just started. */
export function startup(): AppStartupAction {
    return { type: AppActionType.Startup };
}

/** Action to open the settings dialog. */
export type AppOpenSettingsAction = Action<AppActionType.OpenSettings>;

/** Creates an action to open the settings dialog. */
export function openSettings(): AppOpenSettingsAction {
    return { type: AppActionType.OpenSettings };
}

/** Action to close the settings dialog. */
export type AppCloseSettingsAction = Action<AppActionType.CloseSettings>;

/** Creates an action to close the settings dialog. */
export function closeSettings(): AppCloseSettingsAction {
    return { type: AppActionType.CloseSettings };
}

/** Action to toggle documentation visibility. */
export type AppToggleDocsAction = Action<AppActionType.ToggleDocs>;

/** Creates an action to toggle documentation visibility. */
export function toggleDocs(): AppToggleDocsAction {
    return { type: AppActionType.ToggleDocs };
}

/** common type for all app actions. */
export type AppAction =
    | AppStartupAction
    | AppOpenSettingsAction
    | AppCloseSettingsAction
    | AppToggleDocsAction;
