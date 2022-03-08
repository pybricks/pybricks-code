// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createEvent, fireEvent } from '@testing-library/dom';
import { AsyncSaga, delay } from '../../test';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    appDidReceiveBeforeInstallPrompt,
    appDidResolveInstallPrompt,
    appShowInstallPrompt,
    checkForUpdate,
    didCheckForUpdate,
    didInstall,
    reload,
} from './actions';
import app from './sagas';

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

test('reload', async () => {
    const saga = new AsyncSaga(app);

    // mock registration as if service worker was register on app startup
    const registration: Partial<ServiceWorkerRegistration> = {
        unregister: jest.fn(),
    };

    // @ts-expect-error: JSDOM implementation of location.reload() causes error
    delete window.location;
    // @ts-expect-error: JSDOM implementation of location.reload() causes error
    window.location = {
        reload: jest.fn(),
    };

    saga.put(reload(registration as ServiceWorkerRegistration));

    expect(registration.unregister).toHaveBeenCalled();
    expect(location.reload).toHaveBeenCalled();

    await saga.end();
});

test('checkForUpdates', async () => {
    const saga = new AsyncSaga(app);

    // mock registration as if service worker was register on app startup
    const registration: Partial<ServiceWorkerRegistration> = {
        update: jest.fn(),
        installing: null,
    };

    saga.put(checkForUpdate(registration as ServiceWorkerRegistration));

    // yield to allow generators to complete
    await delay(0);

    expect(registration.update).toHaveBeenCalled();

    const action = await saga.take();
    expect(action).toStrictEqual(didCheckForUpdate(false));

    await saga.end();
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
