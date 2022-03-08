// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { eventChannel } from 'redux-saga';
import { call, fork, put, take, takeEvery } from 'typed-redux-saga/macro';
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

function* handleReload(action: ReturnType<typeof reload>): Generator {
    yield* call(() => action.registration.unregister());
    location.reload();
}

function* handleCheckForUpdate(action: ReturnType<typeof checkForUpdate>): Generator {
    yield* call(() => action.registration.update());
    const updateFound = action.registration.installing !== null;
    yield* put(didCheckForUpdate(updateFound));
}

export default function* app(): Generator {
    yield* fork(monitorAppInstalled);
    yield* fork(monitorBeforeInstallPrompt);
    yield* takeEvery(reload, handleReload);
    yield* takeEvery(checkForUpdate, handleCheckForUpdate);
}
