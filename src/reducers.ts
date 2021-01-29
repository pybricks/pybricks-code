// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { combineReducers } from 'redux';
import app, { AppState } from './app/reducers';
import ble, { BleState } from './ble/reducers';
import editor, { EditorState } from './editor/reducers';
import firmware, { FirmwareState } from './firmware/reducers';
import hub, { HubState } from './hub/reducers';
import licenses, { LicenseState } from './licenses/reducers';
import bootloader, { BootloaderState } from './lwp3-bootloader/reducers';
import settings, { SettingsState } from './settings/reducers';
import terminal, { TerminalState } from './terminal/reducers';

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
    licenses,
    settings,
    terminal,
});
