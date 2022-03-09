// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { createAction } from '../actions';

export const serviceWorkerDidUpdate = createAction(() => ({
    type: 'serviceWorker.action.didUpdate',
}));

export const serviceWorkerDidSucceed = createAction(() => ({
    type: 'serviceWorker.action.didSucceed',
}));
