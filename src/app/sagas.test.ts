// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createEvent, fireEvent } from '@testing-library/dom';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    appCheckForUpdate,
    appDidCheckForUpdate,
    appDidReceiveBeforeInstallPrompt,
    appDidResolveInstallPrompt,
    appReload,
    appShowInstallPrompt,
    didInstall,
} from './actions';
import app from './sagas';

jest.mock('../serviceWorkerRegistration');

/**
 * Creates an AsyncSaga initialize with a service worker.
 * @param registration The service worker registration.
 * @returns The saga.
 */
async function createSagaWithRegistration(
    registration: ServiceWorkerRegistration,
): Promise<AsyncSaga> {
    const saga = new AsyncSaga(app);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../serviceWorkerRegistration')._fireOnSuccess(registration);

    const action = await saga.take();
    expect(action).toEqual(serviceWorkerDidSucceed());

    return saga;
}

test('monitorAppInstalled', async () => {
    const saga = new AsyncSaga(app);

    window.dispatchEvent(new Event('appinstalled'));

    const action = await saga.take();
    expect(action).toStrictEqual(didInstall());

    await saga.end();
});

test('monitorBeforeInstallPrompt', async () => {
    const saga = new AsyncSaga(app);

    fireEvent(window, createEvent('beforeinstallprompt', window));

    const action = await saga.take();
    expect(action).toStrictEqual(appDidReceiveBeforeInstallPrompt());

    await saga.end();
});

test('handleAppReload', async () => {
    // mock registration as if service worker was register on app startup
    const registration = mock<ServiceWorkerRegistration>({
        unregister: jest.fn(),
    });

    const saga = await createSagaWithRegistration(registration);

    // @ts-expect-error: JSDOM implementation of location.reload() causes error
    delete window.location;
    // @ts-expect-error: JSDOM implementation of location.reload() causes error
    window.location = {
        reload: jest.fn(),
    };

    saga.put(appReload());

    expect(registration.unregister).toHaveBeenCalled();
    expect(location.reload).toHaveBeenCalled();

    await saga.end();
});

describe('handleAppCheckForUpdate', () => {
    it('should return true if updates are available', async () => {
        // mock registration as if service worker was registered on app startup
        const registration = mock<ServiceWorkerRegistration>({
            update: jest.fn(),
            installing: mock<ServiceWorker>(),
        });

        const saga = await createSagaWithRegistration(registration);

        saga.put(appCheckForUpdate());

        const action = await saga.take();
        expect(action).toStrictEqual(appDidCheckForUpdate(true));
        expect(registration.update).toHaveBeenCalled();

        await saga.end();
    });

    it('should return false if no updates are available', async () => {
        // mock registration as if service worker was registered on app startup
        const registration = mock<ServiceWorkerRegistration>({
            update: jest.fn(),
            installing: null,
        });

        const saga = await createSagaWithRegistration(registration);

        saga.put(appCheckForUpdate());

        const action = await saga.take();
        expect(action).toStrictEqual(appDidCheckForUpdate(false));
        expect(registration.update).toHaveBeenCalled();

        await saga.end();
    });
});

describe('monitorServiceWorkerRegistration', () => {
    it('should dispatch serviceWorkerDidUpdate', async () => {
        const registration = mock<ServiceWorkerRegistration>();
        const saga = await createSagaWithRegistration(registration);

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../serviceWorkerRegistration')._fireOnUpdate(registration);

        const action = await saga.take();
        expect(action).toEqual(serviceWorkerDidUpdate());
    });
});

test('appShowInstallPrompt', async () => {
    const userChoice = {
        outcome: <'accepted' | 'dismissed'>'accepted',
        platform: 'web',
    };

    const saga = new AsyncSaga(app);

    // mock registration as if service worker was register on app startup
    const event = createEvent('beforeinstallprompt', window);
    Object.assign(event, <Partial<BeforeInstallPromptEvent>>{
        prompt: () => Promise.resolve<void>(undefined),
        userChoice: Promise.resolve(userChoice),
    });

    fireEvent(window, event);

    const action = await saga.take();
    expect(action).toStrictEqual(appDidReceiveBeforeInstallPrompt());

    saga.put(appShowInstallPrompt());

    const action2 = await saga.take();
    expect(action2).toStrictEqual(appDidResolveInstallPrompt(userChoice));

    await saga.end();
});
