// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { Action } from '../actions';
import { LicenseActionType } from './actions';

export interface LicenseInfo {
    readonly name: string;
    readonly version: string;
    readonly author: string | undefined;
    readonly license: string;
    readonly licenseText: string;
}

export type LicenseList = LicenseInfo[];

export interface LicenseState {
    readonly list: LicenseList | null;
    readonly selected: LicenseInfo | null;
}

const list: Reducer<LicenseList | null, Action> = (state = null, action) => {
    switch (action.type) {
        case LicenseActionType.DidFetchList:
            return action.list;
        default:
            return state;
    }
};

const selected: Reducer<LicenseInfo | null, Action> = (state = null, action) => {
    switch (action.type) {
        case LicenseActionType.Select:
            return action.info;
        default:
            return state;
    }
};

export default combineReducers({ list, selected });
