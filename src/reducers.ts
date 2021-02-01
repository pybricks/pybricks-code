// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import app from './app/reducers';
import ble from './ble/reducers';
import editor from './editor/reducers';
import firmware from './firmware/reducers';
import hub from './hub/reducers';
import licenses from './licenses/reducers';
import bootloader from './lwp3-bootloader/reducers';
import settings from './settings/reducers';

/**
 * Root reducer for redux store.
 */
export const rootReducer = combineReducers({
    app,
    bootloader,
    ble,
    editor,
    firmware,
    hub,
    licenses,
    settings,
});

/**
 * Root state for redux store.
 */
type StateFromReducer<R> = R extends Reducer<infer S> ? S : never;

export type RootState = StateFromReducer<typeof rootReducer>;
