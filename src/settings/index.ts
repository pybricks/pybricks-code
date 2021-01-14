// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Definitions for user settings.

export enum SettingId {
    ShowDocs = 'showDocs',
    DarkMode = 'darkMode',
}

export function getDefaultBooleanValue(id: SettingId): boolean {
    switch (id) {
        case SettingId.ShowDocs:
            return window.innerWidth >= 1024;
        case SettingId.DarkMode:
            return false;
        default:
            throw Error(`Bad setting id: ${id}`);
    }
}
