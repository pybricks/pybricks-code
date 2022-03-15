// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createAction } from '../actions';
import { StringSettingId } from './defaults';

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

/** Requests to toggle the showDocs setting. */
export const settingsToggleShowDocs = createAction(() => ({
    type: 'editor.action.toggleShowDocs',
}));
