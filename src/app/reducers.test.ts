// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import {
    appCheckForUpdate,
    appDidCheckForUpdate,
    appDidReceiveBeforeInstallPrompt,
    appDidResolveInstallPrompt,
    appShowInstallPrompt,
    didInstall,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "checkingForUpdate": false,
          "hasEditor": false,
          "hasUnresolvedInstallPrompt": false,
          "isServiceWorkerRegistered": false,
          "promptingInstall": false,
          "readyForOfflineUse": false,
          "updateAvailable": false,
        }
    `);
});

describe('isServiceWorkerRegistered', () => {
    it('should be true when service worker registration succeeds', () => {
        expect(
            reducers(
                { isServiceWorkerRegistered: false } as State,
                serviceWorkerDidSucceed(),
            ).isServiceWorkerRegistered,
        ).toBe(true);
    });
});

test('checkingForUpdate', () => {
    expect(
        reducers({ checkingForUpdate: false } as State, appCheckForUpdate())
            .checkingForUpdate,
    ).toBe(true);
    expect(
        reducers({ checkingForUpdate: false } as State, appDidCheckForUpdate(true))
            .checkingForUpdate,
    ).toBe(false);
    expect(
        reducers({ checkingForUpdate: true } as State, appDidCheckForUpdate(true))
            .checkingForUpdate,
    ).toBe(true);
    expect(
        reducers({ checkingForUpdate: true } as State, appDidCheckForUpdate(false))
            .checkingForUpdate,
    ).toBe(false);
    expect(
        reducers({ checkingForUpdate: true } as State, serviceWorkerDidUpdate())
            .checkingForUpdate,
    ).toBe(false);
});

test('updateAvailable', () => {
    expect(
        reducers({ updateAvailable: false } as State, serviceWorkerDidUpdate())
            .updateAvailable,
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
        reducers({ readyForOfflineUse: false } as State, serviceWorkerDidSucceed())
            .readyForOfflineUse,
    ).toBe(true);
});
