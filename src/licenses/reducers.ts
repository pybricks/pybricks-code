// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { didFetchList, select } from './actions';

export interface LicenseInfo {
    readonly name: string;
    readonly version: string;
    readonly author: string | undefined;
    readonly license: string;
    readonly licenseText: string;
}

export type LicenseList = LicenseInfo[];

const list: Reducer<LicenseList | null> = (state = null, action) => {
    if (didFetchList.matches(action)) {
        return action.list;
    }

    return state;
};

const selected: Reducer<LicenseInfo | null> = (state = null, action) => {
    if (select.matches(action)) {
        return action.info;
    }

    return state;
};

export default combineReducers({ list, selected });
