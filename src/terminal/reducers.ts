// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer } from 'react';
import { Observable, combineReducers } from 'redux';
import { Action } from '../actions';
import { TerminalActionType } from './actions';

type DataSource = Observable<string> | null;

const dataSource: Reducer<DataSource, Action> = (state = null, action) => {
    switch (action.type) {
        case TerminalActionType.SetDataSource:
            return action.dataSource;
        default:
            return state;
    }
};

export interface TerminalState {
    readonly dataSource: DataSource;
}

export default combineReducers({ dataSource });
