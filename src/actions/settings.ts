// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';

/** Actions related to settings. */
export enum SettingsActionType {
    ToggleDarkMode = 'settings.action.toggleDarkMode',
}

/** Action to toggle dark mode setting. */
export type SettingsToggleDarkModeAction = Action<SettingsActionType.ToggleDarkMode>;

/** Toggles dark mode setting on or off. */
export function toggleDarkMode(): SettingsToggleDarkModeAction {
    return { type: SettingsActionType.ToggleDarkMode };
}

/** common type for all settings actions. */
export type SettingsAction = SettingsToggleDarkModeAction;
