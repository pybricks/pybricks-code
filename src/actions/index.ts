// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Dispatch as ReduxDispatch } from 'redux';
import { BLEAction, BLEConnectAction, BLEDataAction } from './ble';
import { EditorAction } from './editor';
import { HubAction, HubMessageAction } from './hub';
import {
    BootloaderAction,
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
    | BLEConnectAction
    | BLEDataAction
    | BLEAction
    | BootloaderConnectionAction
    | BootloaderRequestAction
    | BootloaderDidRequestAction
    | BootloaderResponseAction
    | BootloaderAction
    | EditorAction
    | HubMessageAction
    | HubAction
    | MpyAction
    | NotificationAction
    | ServiceWorkerAction
    | TerminalDataAction;

/**
 * Dispatch function.
 */
export type Dispatch = ReduxDispatch<Action>;
