// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer } from 'react';
import { combineReducers } from 'redux';
import { BootloaderAction, BootloaderActionType } from '../actions/bootloader';

const progress: Reducer<number, BootloaderAction> = (state = -1, action) => {
    switch (action.type) {
        case BootloaderActionType.FlashProgress:
            return (action.complete / action.total) * 100;
        default:
            return state;
    }
};

export interface StatusState {
    readonly progress: number;
}

export default combineReducers({ progress });
