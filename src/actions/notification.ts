import { Action } from 'redux';
import { createCountFunc } from '../utils/iter';

export enum NotificationActionType {
    /**
     * Add a notification to the list of notifications.
     */
    Add = 'notification.action.add',
    /**
     * Remove a notification from the list of notifications.
     */
    Remove = 'notification.action.Remove',
}

export type NotificationLevel = 'error' | 'warning' | 'info';

export interface NotificationAddAction extends Action<NotificationActionType.Add> {
    /**
     * Unique ID for this notification instance.
     */
    readonly id: number;
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
}

export interface NotificationRemoveAction
    extends Action<NotificationActionType.Remove> {
    /**
     * ID of an existing notification.
     */
    readonly id: number;
}

export type NotificationAction = NotificationAddAction | NotificationRemoveAction;

const nextId = createCountFunc();

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
    return { type: NotificationActionType.Add, id: nextId(), level, message, helpUrl };
}

/**
 * Action to removes a notification from the list.
 * @param id The id of the notification to remove
 */
export function remove(id: number): NotificationRemoveAction {
    return { type: NotificationActionType.Remove, id };
}
