// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { createAction } from '../actions';

export const hubcenterShowDialog = createAction(() => ({
    type: 'hubcenter.action.showDialog',
}));

export const hubcenterHideDialog = createAction(() => ({
    type: 'hubcenter.action.hideDialog',
}));
