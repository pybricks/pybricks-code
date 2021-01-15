// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { combineReducers } from 'redux';
import app, { AppState } from './app';
import ble, { BleState } from './ble';
import bootloader, { BootloaderState } from './bootloader';
import editor, { EditorState } from './editor';
import hub, { HubState } from './hub';
import notification, { NotificationState } from './notification';
import settings, { SettingsState } from './settings';
import status, { StatusState } from './status';
import terminal, { TerminalState } from './terminal';

/**
 * Root state for redux store.
 */
export interface RootState {
    readonly app: AppState;
    readonly bootloader: BootloaderState;
    readonly ble: BleState;
    readonly editor: EditorState;
    readonly hub: HubState;
    readonly notification: NotificationState;
    readonly settings: SettingsState;
    readonly status: StatusState;
    readonly terminal: TerminalState;
}

export default combineReducers({
    app,
    bootloader,
    ble,
    editor,
    hub,
    notification,
    settings,
    status,
    terminal,
});
