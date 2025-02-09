// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { createAction } from '../actions';

export const hubcenterShowDialog = createAction(() => ({
    type: 'hubcenter.action.showDialog',
}));

export const hubcenterHideDialog = createAction(() => ({
    type: 'hubcenter.action.hideDialog',
}));

export const sendData = createAction((data: string) => ({
    type: 'hubcenter.action.sendData',
    value: data,
}));

export const executeAppDataCommand = createAction((data: ArrayBuffer) => ({
    type: 'hubcenter.action.executeAppDataCommand',
    value: data,
}));
