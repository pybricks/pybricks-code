// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum ServiceWorkerActionType {
    Update = 'serviceWorker.update',
    Success = 'serviceWorker.success',
}

export type ServiceWorkerAction<
    T extends ServiceWorkerActionType = ServiceWorkerActionType
> = Action<T> & {
    registration: ServiceWorkerRegistration;
};

export function update(
    registration: ServiceWorkerRegistration,
): ServiceWorkerAction<ServiceWorkerActionType.Update> {
    return { type: ServiceWorkerActionType.Update, registration };
}

export function success(
    registration: ServiceWorkerRegistration,
): ServiceWorkerAction<ServiceWorkerActionType.Success> {
    return { type: ServiceWorkerActionType.Success, registration };
}
