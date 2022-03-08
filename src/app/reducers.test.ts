// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import {
    appDidReceiveBeforeInstallPrompt,
    appDidResolveInstallPrompt,
    appShowInstallPrompt,
    checkForUpdate,
    didCheckForUpdate,
    didInstall,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "checkingForUpdate": false,
          "hasUnresolvedInstallPrompt": false,
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

describe('hasUnresolvedInstallPrompt', () => {
    it('should be true after BeforeInstallPromptEvent is received', () => {
        expect(
            reducers(
                { hasUnresolvedInstallPrompt: false } as State,
                appDidReceiveBeforeInstallPrompt(),
            ).hasUnresolvedInstallPrompt,
        ).toBe(true);
    });

    it('should be false after the app was successfully installed', () => {
        expect(
            reducers({ hasUnresolvedInstallPrompt: true } as State, didInstall())
                .hasUnresolvedInstallPrompt,
        ).toBe(false);
    });
});

describe('promptingInstall', () => {
    it('should be true when action requesting to show install prompt is seen', () => {
        expect(
            reducers({ promptingInstall: false } as State, appShowInstallPrompt())
                .promptingInstall,
        ).toBe(true);
    });

    it('should be false when user accepts the prompt', () => {
        expect(
            reducers(
                { promptingInstall: true } as State,
                appDidResolveInstallPrompt({ outcome: 'accepted', platform: 'web' }),
            ).promptingInstall,
        ).toBe(false);
    });

    it('should be false when user dismisses the prompt', () => {
        expect(
            reducers(
                { promptingInstall: true } as State,
                appDidResolveInstallPrompt({ outcome: 'dismissed', platform: 'web' }),
            ).promptingInstall,
        ).toBe(false);
    });
});

test('readyForOfflineUse', () => {
    expect(
        reducers(
            { readyForOfflineUse: false } as State,
            serviceWorkerDidSucceed({} as ServiceWorkerRegistration),
        ).readyForOfflineUse,
    ).toBe(true);
});
