// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Definitions for user selectable settings.

import { prefersDarkMode } from '../utils/os';

export enum BooleanSettingId {
    ShowDocs = 'showDocs',
    DarkMode = 'darkMode',
    FlashCurrentProgram = 'flashCurrentProgram',
}

export function getDefaultBooleanValue(id: BooleanSettingId): boolean {
    switch (id) {
        case BooleanSettingId.ShowDocs:
            return window.innerWidth >= 1024;
        case BooleanSettingId.DarkMode:
            return prefersDarkMode();
        case BooleanSettingId.FlashCurrentProgram:
            return false;
        // istanbul ignore next: it is a programmer error if we hit this
        default:
            throw Error(`Bad BooleanSettingId: ${id}`);
    }
}

export enum StringSettingId {
    HubName = 'hubName',
}

export function getDefaultStringValue(id: StringSettingId): string {
    switch (id) {
        case StringSettingId.HubName:
            return ''; // empty string will result in 'Pybricks Hub'
        // istanbul ignore next: it is a programmer error if we hit this
        default:
            throw Error(`Bad StringSettingId: ${id}`);
    }
}
