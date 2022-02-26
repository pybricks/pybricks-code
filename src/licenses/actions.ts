// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createAction } from '../actions';
import { LicenseInfo, LicenseList } from './reducers';

export const fetchList = createAction(() => ({
    type: 'license.action.fetchList',
}));

export const didFetchList = createAction((list: LicenseList) => ({
    type: 'license.action.didFetchList',
    list,
}));

export const didFailToFetchList = createAction((reason: Response) => ({
    type: 'license.action.didFailToFetchList',
    reason,
}));

export const select = createAction((info: LicenseInfo) => ({
    type: 'license.action.select',
    info,
}));
