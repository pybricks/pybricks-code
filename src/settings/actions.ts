// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createAction } from '../actions';
import { BooleanSettingId, StringSettingId } from './defaults';

/** Creates an action to set/store a setting. */
export const setBoolean = createAction((id: BooleanSettingId, newState: boolean) => ({
    type: 'settings.action.setBoolean',
    id,
    newState,
}));

/** Creates an action to toggle a setting. */
export const toggleBoolean = createAction((id: BooleanSettingId) => ({
    type: 'settings.action.toggleBoolean',
    id,
}));

/** Creates an action indicating that setting/storing a setting failed. */
export const didFailToSetBoolean = createAction((id: BooleanSettingId, err: Error) => ({
    type: 'settings.action.didFailToSetBoolean',
    id,
    err,
}));

/** Creates an action that indicates a stored boolean setting value changed. */
export const didBooleanChange = createAction(
    (id: BooleanSettingId, newState: boolean) => ({
        type: 'settings.action.didBooleanChange',
        id,
        newState,
    }),
);

/** Creates an action to set/store a setting. */
export const setString = createAction((id: StringSettingId, newState: string) => ({
    type: 'settings.action.setString',
    id,
    newState,
}));

/** Creates an action indicating that setting/storing a setting failed. */
export const didFailToSetString = createAction((id: StringSettingId, err: Error) => ({
    type: 'settings.action.didFailToSetString',
    id,
    err,
}));

export const didStringChange = createAction(
    (id: StringSettingId, newState: string) => ({
        type: 'settings.action.didStringChange',
        id,
        newState,
    }),
);
