// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    checkForUpdate,
    didBeforeInstallPrompt,
    didCheckForUpdate,
    didInstall,
    didInstallPrompt,
    installPrompt,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "beforeInstallPrompt": null,
          "checkingForUpdate": false,
          "promptingInstall": false,
          "readyForOfflineUse": false,
          "serviceWorker": null,
          "updateAvailable": false,
        }
    `);
});

test('serviceWorker', () => {
    const registration = {} as ServiceWorkerRegistration;
    expect(
        reducers(
            { serviceWorker: null } as State,
            serviceWorkerDidSucceed(registration),
        ).serviceWorker,
    ).toBe(registration);
});

test('checkingForUpdate', () => {
    expect(
        reducers(
            { checkingForUpdate: false } as State,
            checkForUpdate({} as ServiceWorkerRegistration),
        ).checkingForUpdate,
    ).toBe(true);
    expect(
        reducers({ checkingForUpdate: false } as State, didCheckForUpdate(true))
            .checkingForUpdate,
    ).toBe(false);
    expect(
        reducers({ checkingForUpdate: true } as State, didCheckForUpdate(true))
            .checkingForUpdate,
    ).toBe(true);
    expect(
        reducers({ checkingForUpdate: true } as State, didCheckForUpdate(false))
            .checkingForUpdate,
    ).toBe(false);
    expect(
        reducers(
            { checkingForUpdate: true } as State,
            serviceWorkerDidUpdate({} as ServiceWorkerRegistration),
        ).checkingForUpdate,
    ).toBe(false);
});

test('updateAvailable', () => {
    expect(
        reducers(
            { updateAvailable: false } as State,
            serviceWorkerDidUpdate({} as ServiceWorkerRegistration),
        ).updateAvailable,
    ).toBe(true);
});

test('beforeInstallPrompt', () => {
    const event = {} as BeforeInstallPromptEvent;
    expect(
        reducers({ beforeInstallPrompt: null } as State, didBeforeInstallPrompt(event))
            .beforeInstallPrompt,
    ).toBe(event);
    expect(
        reducers({ beforeInstallPrompt: event } as State, didInstall())
            .beforeInstallPrompt,
    ).toBe(null);
});

test('promptingInstall', () => {
    expect(
        reducers(
            { promptingInstall: false } as State,
            installPrompt({} as BeforeInstallPromptEvent),
        ).promptingInstall,
    ).toBe(true);
    expect(
        reducers({ promptingInstall: true } as State, didInstallPrompt())
            .promptingInstall,
    ).toBe(false);
});

test('readyForOfflineUse', () => {
    expect(
        reducers(
            { readyForOfflineUse: false } as State,
            serviceWorkerDidSucceed({} as ServiceWorkerRegistration),
        ).readyForOfflineUse,
    ).toBe(true);
});
