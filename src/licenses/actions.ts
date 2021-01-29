// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';
import { LicenseInfo, LicenseList } from './reducers';

export enum LicenseActionType {
    DidFetchList = 'license.action.didFetchList',
    DidFailToFetchList = 'license.action.didFailToFetchList',
    Select = 'license.action.select',
}

export type LicenseDidFetchListAction = Action<LicenseActionType.DidFetchList> & {
    list: LicenseList;
};

export function didFetchList(list: LicenseList): LicenseDidFetchListAction {
    return { type: LicenseActionType.DidFetchList, list };
}

export type LicenseDidFailToFetchListAction = Action<LicenseActionType.DidFailToFetchList> & {
    reason: Response;
};

export function didFailToFetchList(reason: Response): LicenseDidFailToFetchListAction {
    return { type: LicenseActionType.DidFailToFetchList, reason };
}

export type LicenseSelectAction = Action<LicenseActionType.Select> & {
    info: LicenseInfo;
};

export function select(info: LicenseInfo): LicenseSelectAction {
    return { type: LicenseActionType.Select, info };
}

export type LicenseAction =
    | LicenseDidFetchListAction
    | LicenseDidFailToFetchListAction
    | LicenseSelectAction;
