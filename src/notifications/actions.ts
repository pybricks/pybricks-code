// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { createAction } from '../actions';

export type NotificationLevel = 'error' | 'warning' | 'info';

/**
 * Action to add a notification to the list.
 * @param level The severity level
 * @param message The message to display to the user
 * @param helpUrl An optional URL for more info
 */
export const add = createAction(
    (level: NotificationLevel, message: string, helpUrl?: string) => ({
        type: 'notification.action.add',
        level,
        message,
        helpUrl,
    }),
);
