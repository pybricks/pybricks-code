// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors

import { createAction } from '../actions';

export const didUpdate = createAction((registration: ServiceWorkerRegistration) => ({
    type: 'serviceWorker.action.didUpdate',
    registration,
}));

export const didSucceed = createAction((registration: ServiceWorkerRegistration) => ({
    type: 'serviceWorker.action.didSucceed',
    registration,
}));
