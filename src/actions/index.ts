// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Dispatch as ReduxDispatch } from 'redux';
import { AppAction } from './app';
import { BLEAction, BLEConnectAction } from './ble';
import { BleUartAction } from './ble-uart';
import { EditorAction } from './editor';
import { FlashFirmwareAction } from './flash-firmware';
import { HubAction, HubMessageAction } from './hub';
import {
    BootloaderConnectionAction,
    BootloaderDidRequestAction,
    BootloaderRequestAction,
    BootloaderResponseAction,
} from './lwp3-bootloader';
import { MpyAction } from './mpy';
import { NotificationAction } from './notification';
import { ServiceWorkerAction } from './service-worker';
import { TerminalDataAction } from './terminal';

/**
 * Common type for all actions.
 */
export type Action =
    | AppAction
    | BLEAction
    | BLEConnectAction
    | BleUartAction
    | BootloaderConnectionAction
    | BootloaderDidRequestAction
    | BootloaderRequestAction
    | BootloaderResponseAction
    | EditorAction
    | FlashFirmwareAction
    | HubAction
    | HubMessageAction
    | MpyAction
    | NotificationAction
    | ServiceWorkerAction
    | TerminalDataAction;

/**
 * Dispatch function.
 */
export type Dispatch = ReduxDispatch<Action>;
