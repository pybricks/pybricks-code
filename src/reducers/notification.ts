// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer } from 'react';
import { combineReducers } from 'redux';
import { Action } from '../actions';
import { EditorActionType, reloadProgram } from '../actions/editor';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionFailureReason,
} from '../actions/lwp3-bootloader';
import { MpyActionType } from '../actions/mpy';
import { NotificationActionType } from '../actions/notification';
import { ServiceWorkerActionType } from '../actions/service-worker';
import { createCountFunc } from '../utils/iter';

export enum MessageId {
    BleCannotWriteWithoutResponse = 'ble.cannotWriteWithoutResponse',
    BleConnectFailed = 'ble.connectFailed',
    BleGattServiceNotFound = 'ble.gattServiceNotFound',
    BleNoWebBluetooth = 'ble.noWebBluetooth',
    ProgramChanged = 'editor.programChanged',
    ServiceWorkerSuccess = 'serviceWorker.success',
    ServiceWorkerUpdate = 'serviceWorker.update',
    YesReloadProgram = 'editor.yesReloadProgram',
}

/**
 * Severity level of notification.
 */
export enum Level {
    /**
     * This is an error (requires user action to resolve)
     */
    Error = 'error',
    /**
     * This is a warning (user could take action or ignore)
     */
    Warning = 'warning',
    /**
     * This is just FYI (no user action required)
     */
    Info = 'info',
}

export interface MessageAction {
    titleId: MessageId;
    action: Action;
}

export interface Notification {
    readonly id: number;
    readonly level: Level;
    readonly message?: string;
    readonly messageId?: MessageId;
    readonly helpUrl?: string;
    readonly action?: MessageAction;
}

export type NotificationList = Array<Notification>;

const nextId = createCountFunc();

function append(
    state: NotificationList,
    level: Level,
    messageId: MessageId,
    helpUrl?: string,
    action?: MessageAction,
): NotificationList {
    return [...state, { id: nextId(), level, messageId, helpUrl, action }];
}

const list: Reducer<NotificationList, Action> = (state = [], action) => {
    switch (action.type) {
        case BootloaderConnectionActionType.DidConnect:
            if (!action.canWriteWithoutResponse) {
                return append(
                    state,
                    Level.Warning,
                    MessageId.BleCannotWriteWithoutResponse,
                    'https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md',
                );
            }
            return state;
        case BootloaderConnectionActionType.DidFailToConnect:
            switch (action.reason) {
                case BootloaderConnectionFailureReason.GattServiceNotFound:
                    return append(state, Level.Error, MessageId.BleGattServiceNotFound);
                case BootloaderConnectionFailureReason.NoWebBluetooth:
                    return append(
                        state,
                        Level.Error,
                        MessageId.BleNoWebBluetooth,
                        'https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md',
                    );
                case BootloaderConnectionFailureReason.Unknown:
                    return append(state, Level.Error, MessageId.BleConnectFailed);
            }
            return state;
        case EditorActionType.StorageChanged:
            if (state.find((x) => x.messageId === MessageId.ProgramChanged)) {
                // don't show message again if it is already shown
                return state;
            }
            return append(state, Level.Info, MessageId.ProgramChanged, undefined, {
                titleId: MessageId.YesReloadProgram,
                action: reloadProgram(),
            });
        case MpyActionType.DidFailToCompile:
            return [
                ...state,
                { id: nextId(), level: Level.Error, message: action.err },
            ];
        case NotificationActionType.Add:
            return [
                ...state,
                {
                    id: action.id,
                    level: action.level as Level,
                    message: action.message,
                    helpUrl: action.helpUrl,
                },
            ];
        case NotificationActionType.Remove:
            return state.filter((e) => e.id !== action.id);
        case ServiceWorkerActionType.Update:
            return append(
                state,
                Level.Info,
                MessageId.ServiceWorkerUpdate,
                'https://bit.ly/CRA-PWA',
            );
        case ServiceWorkerActionType.Success:
            return append(state, Level.Info, MessageId.ServiceWorkerSuccess);
        default:
            return state;
    }
};

export interface NotificationState {
    readonly list: NotificationList;
}

export default combineReducers({ list });
