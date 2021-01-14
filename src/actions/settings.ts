// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';

/** Actions related to settings. */
export enum SettingsActionType {
    ToggleDocs = 'settings.action.toggleDocs',
    ToggleDarkMode = 'settings.action.toggleDarkMode',
}

/** Action to toggle show docs setting. */
export type SettingsToggleDocsAction = Action<SettingsActionType.ToggleDocs>;

/** Toggles show docs setting on or off. */
export function toggleDocs(): SettingsToggleDocsAction {
    return { type: SettingsActionType.ToggleDocs };
}

/** Action to toggle dark mode setting. */
export type SettingsToggleDarkModeAction = Action<SettingsActionType.ToggleDarkMode>;

/** Toggles dark mode setting on or off. */
export function toggleDarkMode(): SettingsToggleDarkModeAction {
    return { type: SettingsActionType.ToggleDarkMode };
}

/** common type for all settings actions. */
export type SettingsAction = SettingsToggleDocsAction | SettingsToggleDarkModeAction;
