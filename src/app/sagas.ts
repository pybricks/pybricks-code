// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { eventChannel } from 'redux-saga';
import { call, delay, fork, put, take, takeEvery } from 'typed-redux-saga/macro';
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';
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

/**
 * Handles appReload actions.
 *
 * Must be called (forked) with serviceWorkerRegistration context set.
 */
function* handleAppReload(registration: ServiceWorkerRegistration): Generator {
    yield* call(() => registration.unregister());

    location.reload();
}

/**
 * Handles appCheckForUpdate actions.
 *
 * Must be called (forked) with serviceWorkerRegistration context set.
 */
function* handleAppCheckForUpdate(registration: ServiceWorkerRegistration): Generator {
    yield* call(() => registration.update());
    const updateFound = registration.installing !== null;
    yield* put(appDidCheckForUpdate(updateFound));
}

/**
 * Marshals CRA serviceWorkerRegistration to saga.
 */
function* monitorServiceWorkerRegistration(): Generator {
    const chan = eventChannel<{
        isUpdate: boolean;
        registration: ServiceWorkerRegistration;
    }>((emit) => {
        serviceWorkerRegistration.register({
            onSuccess: (r) => emit({ isUpdate: false, registration: r }),
            onUpdate: (r) => emit({ isUpdate: true, registration: r }),
        });

        // istanbul ignore next: never unregistered
        return () => serviceWorkerRegistration.unregister();
    });

    // HACK: is assumed that this will only be called at most two times, once
    // with isUpdate === false and after that, once with isUpdate === true.
    while (true) {
        const { isUpdate, registration } = yield* take(chan);

        if (isUpdate) {
            yield* put(serviceWorkerDidUpdate());
        } else {
            yield* takeEvery(appReload, handleAppReload, registration);
            yield* takeEvery(appCheckForUpdate, handleAppCheckForUpdate, registration);

            yield* put(serviceWorkerDidSucceed());
        }
    }
}

function* monitorAppInstalled(): Generator {
    const chan = eventChannel<Event>((emit) => {
        const listener = (e: Event) => {
            emit(e);
        };
        // chromium-only event
        window.addEventListener('appinstalled', listener);
        // istanbul ignore next: currently we don't ever stop monitoring
        return () => window.removeEventListener('appinstalled', listener);
    });

    while (true) {
        yield* take(chan);
        yield* put(didInstall());
    }
}

function* handleBeforeInstallPromptEvent(event: BeforeInstallPromptEvent): Generator {
    // wait for user to request to install the app - may never happen
    yield* take(appShowInstallPrompt);

    yield* call(() => event.prompt());
    const choice = yield* call(() => event.userChoice);
    yield* put(appDidResolveInstallPrompt(choice));
}

function* monitorBeforeInstallPrompt(): Generator {
    const chan = eventChannel<BeforeInstallPromptEvent>((emit) => {
        const listener = (e: BeforeInstallPromptEvent) => {
            emit(e);
        };
        // @ts-expect-error: chromium-only event
        window.addEventListener('beforeinstallprompt', listener);
        // istanbul ignore next: currently we don't ever stop monitoring
        // @ts-expect-error: chromium-only event
        return () => window.removeEventListener('beforeinstallprompt', listener);
    });

    // in theory, the before install prompt event should only happen once, so
    // we don't bother canceling the forked task when another event is received
    while (true) {
        const event = yield* take(chan);
        yield* fork(handleBeforeInstallPromptEvent, event);
        yield* put(appDidReceiveBeforeInstallPrompt());
    }
}

// istabul ignore next: for dev environment only
function* fakeCheckForUpdate(): Generator {
    console.warn('checking for updates is not supported in development mode');
    // let the "busy" indication spin for a bit
    yield* delay(3000);
    // then indicate we are already up-to-date
    yield* put(appDidCheckForUpdate(false));
}

export default function* app(): Generator {
    yield* fork(monitorServiceWorkerRegistration);
    yield* fork(monitorAppInstalled);
    yield* fork(monitorBeforeInstallPrompt);

    // istabul ignore if: for dev environment only
    if (process.env.NODE_ENV === 'development') {
        yield* takeEvery(appCheckForUpdate, fakeCheckForUpdate);
    }
}
