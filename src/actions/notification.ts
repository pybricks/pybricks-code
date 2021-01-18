// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Action } from 'redux';

export enum NotificationActionType {
    /** Add a notification to the list of notifications. */
    Add = 'notification.action.add',
}

export type NotificationLevel = 'error' | 'warning' | 'info';

export type NotificationAddAction = Action<NotificationActionType.Add> & {
    /**
     * The type of notification.
     */
    readonly level: NotificationLevel;
    /**
     * The message to be displayed to the user.
     */
    readonly message: string;
    /**
     * URL for help or more information.
     */
    readonly helpUrl?: string;
};

/**
 * Action to add a notification to the list.
 * @param level The severity level
 * @param message The message to display to the user
 * @param helpUrl An optional URL for more info
 */
export function add(
    level: NotificationLevel,
    message: string,
    helpUrl?: string,
): NotificationAddAction {
    return { type: NotificationActionType.Add, level, message, helpUrl };
}

export type NotificationAction = NotificationAddAction;
