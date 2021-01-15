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

/** common type for all app actions. */
export type AppAction =
    | AppStartupAction
    | AppOpenSettingsAction
    | AppCloseSettingsAction;
