// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Definitions for user selectable settings.

import { prefersDarkMode } from '../utils/os';

export enum SettingId {
    ShowDocs = 'showDocs',
    DarkMode = 'darkMode',
    FlashCurrentProgram = 'flashCurrentProgram',
}

export function getDefaultBooleanValue(id: SettingId): boolean {
    switch (id) {
        case SettingId.ShowDocs:
            return window.innerWidth >= 1024;
        case SettingId.DarkMode:
            return prefersDarkMode();
        case SettingId.FlashCurrentProgram:
            return false;
        // istanbul ignore next: it is a programmer error if we hit this
        default:
            throw Error(`Bad setting id: ${id}`);
    }
}
