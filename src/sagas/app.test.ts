// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AsyncSaga, delay } from '../../test';
import { checkForUpdate, didCheckForUpdate, reload } from '../actions/app';
import app from './app';

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

    // yield to allow generators to complete
    await delay(0);

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
