// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';
import { BooleanSettingId, StringSettingId } from './defaults';

/** Actions related to settings. */
export enum SettingsActionType {
    SetBoolean = 'settings.action.setBoolean',
    ToggleBoolean = 'settings.action.toggleBoolean',
    DidFailToSetBoolean = 'settings.action.didFailToSetBoolean',
    DidBooleanChange = 'settings.action.didBooleanChange',
    SetString = 'settings.action.setString',
    DidFailToSetString = 'settings.action.didFailToSetString',
    DidStringChange = 'settings.action.didStringChange',
}

type SettingInfo<TId, TState> = {
    /** The ID of the setting. */
    id: TId;
    /** The new state for the setting. */
    newState: TState;
};

/** Action to set/store a setting. */
export type SettingsSetBooleanAction = Action<SettingsActionType.SetBoolean> &
    SettingInfo<BooleanSettingId, boolean>;

/** Creates an action to set/store a setting. */
export function setBoolean(
    id: BooleanSettingId,
    newState: boolean,
): SettingsSetBooleanAction {
    return { type: SettingsActionType.SetBoolean, id, newState };
}

/** Action to toggle a setting. */
export type SettingsToggleBooleanAction = Action<SettingsActionType.ToggleBoolean> & {
    id: BooleanSettingId;
};

/** Creates an action to toggle a setting. */
export function toggleBoolean(id: BooleanSettingId): SettingsToggleBooleanAction {
    return { type: SettingsActionType.ToggleBoolean, id };
}

/** Action that indicates setting/storing a setting failed. */
export type SettingsDidFailToSetBooleanAction =
    Action<SettingsActionType.DidFailToSetBoolean> & {
        id: BooleanSettingId;
        err: Error;
    };

/** Creates an action indicating that setting/storing a setting failed. */
export function didFailToSetBoolean(
    id: BooleanSettingId,
    err: Error,
): SettingsDidFailToSetBooleanAction {
    return { type: SettingsActionType.DidFailToSetBoolean, id, err };
}

/** Action that indicates a stored boolean setting value changed. */
export type SettingsDidBooleanChangeAction =
    Action<SettingsActionType.DidBooleanChange> &
        SettingInfo<BooleanSettingId, boolean>;

/** Creates an action that indicates a stored boolean setting value changed. */
export function didBooleanChange(
    id: BooleanSettingId,
    newState: boolean,
): SettingsDidBooleanChangeAction {
    return { type: SettingsActionType.DidBooleanChange, id, newState };
}

/** Action to set/store a setting. */
export type SettingsSetStringAction = Action<SettingsActionType.SetString> &
    SettingInfo<StringSettingId, string>;

/** Creates an action to set/store a setting. */
export function setString(
    id: StringSettingId,
    newState: string,
): SettingsSetStringAction {
    return { type: SettingsActionType.SetString, id, newState };
}

/** Action that indicates setting/storing a setting failed. */
export type SettingsDidFailToSetStringAction =
    Action<SettingsActionType.DidFailToSetString> & {
        id: StringSettingId;
        err: Error;
    };

/** Creates an action indicating that setting/storing a setting failed. */
export function didFailToSetString(
    id: StringSettingId,
    err: Error,
): SettingsDidFailToSetStringAction {
    return { type: SettingsActionType.DidFailToSetString, id, err };
}

export type SettingsDidStringChangeAction = Action<SettingsActionType.DidStringChange> &
    SettingInfo<StringSettingId, string>;

export function didStringChange(
    id: StringSettingId,
    newState: string,
): SettingsDidStringChangeAction {
    return { type: SettingsActionType.DidStringChange, id, newState };
}

/** Common type for all settings actions. */
export type SettingsAction =
    | SettingsSetBooleanAction
    | SettingsToggleBooleanAction
    | SettingsDidFailToSetBooleanAction
    | SettingsDidBooleanChangeAction
    | SettingsSetStringAction
    | SettingsDidFailToSetStringAction
    | SettingsDidStringChangeAction;
