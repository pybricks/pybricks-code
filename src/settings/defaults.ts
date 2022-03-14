// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Definitions for user selectable settings.

export enum BooleanSettingId {
    ShowDocs = 'showDocs',
    FlashCurrentProgram = 'flashCurrentProgram',
}

export function getDefaultBooleanValue(id: BooleanSettingId): boolean {
    switch (id) {
        case BooleanSettingId.ShowDocs:
            return window.innerWidth >= 1024;
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
