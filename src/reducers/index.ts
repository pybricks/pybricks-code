// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { combineReducers } from 'redux';
import app, { AppState } from './app';
import ble, { BleState } from './ble';
import bootloader, { BootloaderState } from './bootloader';
import editor, { EditorState } from './editor';
import firmware, { FirmwareState } from './firmware';
import hub, { HubState } from './hub';
import license, { LicenseState } from './license';
import settings, { SettingsState } from './settings';
import terminal, { TerminalState } from './terminal';

/**
 * Root state for redux store.
 */
export interface RootState {
    readonly app: AppState;
    readonly bootloader: BootloaderState;
    readonly ble: BleState;
    readonly editor: EditorState;
    readonly firmware: FirmwareState;
    readonly hub: HubState;
    readonly license: LicenseState;
    readonly settings: SettingsState;
    readonly terminal: TerminalState;
}

export default combineReducers({
    app,
    bootloader,
    ble,
    editor,
    firmware,
    hub,
    license,
    settings,
    terminal,
});
