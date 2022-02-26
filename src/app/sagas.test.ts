// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AsyncSaga, delay } from '../../test';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    checkForUpdate,
    didBeforeInstallPrompt,
    didCheckForUpdate,
    didInstall,
    didInstallPrompt,
    installPrompt,
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

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
    window.dispatchEvent(event);

    const action = await saga.take();
    expect(action).toStrictEqual(didBeforeInstallPrompt(event));

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

test('installPrompt', async () => {
    const saga = new AsyncSaga(app);

    // mock registration as if service worker was register on app startup
    const event: Partial<BeforeInstallPromptEvent> = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    };

    saga.put(installPrompt(event as BeforeInstallPromptEvent));

    expect(event.prompt).toHaveBeenCalled();

    const action = await saga.take();
    expect(action).toStrictEqual(didInstallPrompt());

    await saga.end();
});
