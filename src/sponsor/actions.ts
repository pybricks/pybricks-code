// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

export const sponsorShowDialog = createAction(() => ({
    type: 'sponsor.action.showDialog',
}));

export const sponsorHideDialog = createAction(() => ({
    type: 'sponsor.action.hideDialog',
}));
