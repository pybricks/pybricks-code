// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { eventChannel } from 'redux-saga';
import { call, fork, put, take, takeEvery } from 'typed-redux-saga/macro';
import { BeforeInstallPromptEvent } from '../utils/dom';
import {
    AppActionType,
    AppCheckForUpdatesAction,
    AppInstallPromptAction,
    AppReloadAction,
    didBeforeInstallPrompt,
    didCheckForUpdate,
    didInstall,
    didInstallPrompt,
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

    while (true) {
        const event = yield* take(chan);
        yield* put(didBeforeInstallPrompt(event));
    }
}

function* reload(action: AppReloadAction): Generator {
    yield* call(() => action.registration.unregister());
    location.reload();
}

function* checkForUpdate(action: AppCheckForUpdatesAction): Generator {
    yield* call(() => action.registration.update());
    const updateFound = action.registration.installing !== null;
    yield* put(didCheckForUpdate(updateFound));
}

function* installPrompt(action: AppInstallPromptAction): Generator {
    yield* call(() => action.event.prompt());
    yield* call(() => action.event.userChoice);
    yield* put(didInstallPrompt());
}

export default function* app(): Generator {
    yield* fork(monitorAppInstalled);
    yield* fork(monitorBeforeInstallPrompt);
    yield* takeEvery(AppActionType.Reload, reload);
    yield* takeEvery(AppActionType.CheckForUpdate, checkForUpdate);
    yield* takeEvery(AppActionType.InstallPrompt, installPrompt);
}
