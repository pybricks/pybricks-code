import { Reducer } from 'react';
import { combineReducers } from 'redux';
import { NotificationAction, NotificationActionType } from '../actions/notification';

export type NotificationList = Array<{
    readonly id: number;
    readonly style: string;
    readonly message: string;
    readonly helpUrl?: string;
}>;

const levelMap = {
    error: 'danger',
    warning: 'warning',
    info: 'info',
};

const list: Reducer<NotificationList, NotificationAction> = (state = [], action) => {
    switch (action.type) {
        case NotificationActionType.Add:
            return [
                ...state,
                {
                    id: action.id,
                    style: levelMap[action.level],
                    message: action.message,
                    helpUrl: action.helpUrl,
                },
            ];
        case NotificationActionType.Remove:
            return state.filter((e) => e.id !== action.id);
        default:
            return state;
    }
};

export interface NotificationState {
    readonly list: NotificationList;
}

export default combineReducers({ list });
