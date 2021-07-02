// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { EditorActionType } from './actions';

const current: Reducer<monaco.editor.ICodeEditor | null, Action> = (
    state = null,
    action,
) => {
    switch (action.type) {
        case EditorActionType.Current:
            return action.editSession || null;
        default:
            return state;
    }
};

export default combineReducers({ current });
