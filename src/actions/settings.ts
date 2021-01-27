// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';
import { SettingId } from '../settings/user';

/** Actions related to settings. */
export enum SettingsActionType {
    SetBoolean = 'settings.action.setBoolean',
    ToggleBoolean = 'settings.action.toggleBoolean',
    DidFailToSetBoolean = 'settings.action.didFailToSetBoolean',
    DidBooleanChange = 'settings.action.didBooleanChange',
}

type SettingInfo<T> = {
    /** The ID of the setting. */
    id: SettingId;
    /** The new state for the setting. */
    newState: T;
};

/** Action to set/store a setting. */
export type SettingsSetBooleanAction = Action<SettingsActionType.SetBoolean> &
    SettingInfo<boolean>;

/** Creates an action to set/store a setting. */
export function setBoolean(id: SettingId, newState: boolean): SettingsSetBooleanAction {
    return { type: SettingsActionType.SetBoolean, id, newState };
}

/** Action to toggle a setting. */
export type SettingsToggleBooleanAction = Action<SettingsActionType.ToggleBoolean> & {
    id: SettingId;
};

/** Creates an action to toggle a setting. */
export function toggleBoolean(id: SettingId): SettingsToggleBooleanAction {
    return { type: SettingsActionType.ToggleBoolean, id };
}

/** Action that indicates setting/storing a setting failed. */
export type SettingsDidFailToSetBooleanAction = Action<SettingsActionType.DidFailToSetBoolean> & {
    id: SettingId;
    err: Error;
};

/** Creates an action indicating that setting/storing a setting failed. */
export function didFailToSetBoolean(
    id: SettingId,
    err: Error,
): SettingsDidFailToSetBooleanAction {
    return { type: SettingsActionType.DidFailToSetBoolean, id, err };
}

/** Action that indicates a stored boolean setting value changed. */
export type SettingsDidBooleanChangeAction = Action<SettingsActionType.DidBooleanChange> &
    SettingInfo<boolean>;

/** Creates an action that indicates a stored boolean setting value changed. */
export function didBooleanChange(
    id: SettingId,
    newState: boolean,
): SettingsDidBooleanChangeAction {
    return { type: SettingsActionType.DidBooleanChange, id, newState };
}

/** Common type for all settings actions. */
export type SettingsAction =
    | SettingsSetBooleanAction
    | SettingsToggleBooleanAction
    | SettingsDidFailToSetBooleanAction
    | SettingsDidBooleanChangeAction;
