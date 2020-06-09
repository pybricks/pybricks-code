// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer } from 'react';
import { combineReducers } from 'redux';
import { Action } from '../actions';
import { FlashFirmwareActionType } from '../actions/flash-firmware';

const progress: Reducer<number, Action> = (state = -1, action) => {
    switch (action.type) {
        case FlashFirmwareActionType.Progress:
            return action.complete / action.total;
        default:
            return state;
    }
};

export interface StatusState {
    readonly progress: number;
}

export default combineReducers({ progress });
