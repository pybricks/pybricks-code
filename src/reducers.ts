// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { Reducer, combineReducers } from 'redux';
import app from './app/reducers';
import ble from './ble/reducers';
import fileStorage from './fileStorage/reducers';
import firmware from './firmware/reducers';
import hub from './hub/reducers';
import bootloader from './lwp3-bootloader/reducers';

/**
 * Root reducer for redux store.
 */
export const rootReducer = combineReducers({
    app,
    bootloader,
    ble,
    fileStorage,
    firmware,
    hub,
});

/**
 * Root state for redux store.
 */
type StateFromReducer<R> = R extends Reducer<infer S> ? S : never;

export type RootState = StateFromReducer<typeof rootReducer>;

/**
 * Typed version of react-redux useSelector() hook.
 */
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
