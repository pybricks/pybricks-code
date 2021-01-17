// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';
import { LicenseInfo, LicenseList } from '../reducers/license';

export enum LicenseActionType {
    DidFetchList = 'license.action.didFetchList',
    Select = 'license.action.select',
}

export type LicenseDidFetchListAction = Action<LicenseActionType.DidFetchList> & {
    list: LicenseList;
};

export function didFetchList(list: LicenseList): LicenseDidFetchListAction {
    return { type: LicenseActionType.DidFetchList, list };
}

export type LicenseSelectAction = Action<LicenseActionType.Select> & {
    info: LicenseInfo;
};

export function select(info: LicenseInfo): LicenseSelectAction {
    return { type: LicenseActionType.Select, info };
}

export type LicenseAction = LicenseDidFetchListAction | LicenseSelectAction;
