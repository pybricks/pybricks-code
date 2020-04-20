import { Action } from 'redux';

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
}

export interface NotificationRemoveAction
    extends Action<NotificationActionType.Remove> {
    /**
     * ID of an existing notification.
     */
    readonly id: number;
}

export type NotificationAction = NotificationAddAction | NotificationRemoveAction;

let nextId = 0;

export function add(level: NotificationLevel, message: string): NotificationAddAction {
    return { type: NotificationActionType.Add, id: nextId++, level, message };
}

export function remove(id: number): NotificationRemoveAction {
    return { type: NotificationActionType.Remove, id };
}
