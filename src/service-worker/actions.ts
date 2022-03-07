// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { createAction } from '../actions';

export const serviceWorkerDidUpdate = createAction(
    (registration: ServiceWorkerRegistration) => ({
        type: 'serviceWorker.action.didUpdate',
        registration,
    }),
);

export const serviceWorkerDidSucceed = createAction(
    (registration: ServiceWorkerRegistration) => ({
        type: 'serviceWorker.action.didSucceed',
        registration,
    }),
);
