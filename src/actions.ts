// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { useDispatch as useReduxDispatch } from 'react-redux';
import { Dispatch as ReduxDispatch } from 'redux';
import { AppAction } from './app/actions';
import { BleDIServiceAction } from './ble-device-info-service/actions';
import { BleUartAction } from './ble-nordic-uart-service/actions';
import {
    BlePybricksServiceAction,
    BlePybricksServiceCommandAction,
    BlePybricksServiceEventAction,
} from './ble-pybricks-service/actions';
import { BLEAction, BLEConnectAction } from './ble/actions';
import { EditorAction } from './editor/actions';
import { FlashFirmwareAction } from './firmware/actions';
import { HubAction, HubMessageAction } from './hub/actions';
import { LicenseAction } from './licenses/actions';
import {
    BootloaderConnectionAction,
    BootloaderDidFailToRequestAction,
    BootloaderDidRequestAction,
    BootloaderRequestAction,
    BootloaderResponseAction,
} from './lwp3-bootloader/actions';
import { MpyAction } from './mpy/actions';
import { NotificationAction } from './notifications/actions';
import { ServiceWorkerAction } from './service-worker/actions';
import { SettingsAction } from './settings/actions';
import { TerminalDataAction } from './terminal/actions';

/**
 * Common type for all actions.
 */
export type Action =
    | AppAction
    | BLEAction
    | BLEConnectAction
    | BleDIServiceAction
    | BlePybricksServiceAction
    | BlePybricksServiceCommandAction
    | BlePybricksServiceEventAction
    | BleUartAction
    | BootloaderConnectionAction
    | BootloaderDidRequestAction
    | BootloaderDidFailToRequestAction
    | BootloaderRequestAction
    | BootloaderResponseAction
    | EditorAction
    | FlashFirmwareAction
    | HubAction
    | HubMessageAction
    | LicenseAction
    | MpyAction
    | NotificationAction
    | ServiceWorkerAction
    | SettingsAction
    | TerminalDataAction;

/**
 * Dispatch function.
 */
export type Dispatch = ReduxDispatch<Action>;

/**
 * Typed version of Redux useDispatch() hook.
 */
export const useDispatch = (): Dispatch => useReduxDispatch<Dispatch>();
