// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum ServiceWorkerActionType {
    DidUpdate = 'serviceWorker.didUpdate',
    DidSucceed = 'serviceWorker.didSucceed',
}

export type ServiceWorkerAction<
    T extends ServiceWorkerActionType = ServiceWorkerActionType
> = Action<T> & {
    registration: ServiceWorkerRegistration;
};

export function didUpdate(
    registration: ServiceWorkerRegistration,
): ServiceWorkerAction<ServiceWorkerActionType.DidUpdate> {
    return { type: ServiceWorkerActionType.DidUpdate, registration };
}

export function didSucceed(
    registration: ServiceWorkerRegistration,
): ServiceWorkerAction<ServiceWorkerActionType.DidSucceed> {
    return { type: ServiceWorkerActionType.DidSucceed, registration };
}
