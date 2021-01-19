// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, takeEvery } from 'redux-saga/effects';
import { AppActionType } from '../actions/app';

function* reload(): Generator {
    // unregister the service worker so that when the page reloads, it uses
    // the new version
    const registrations = (yield call(() =>
        navigator.serviceWorker.getRegistrations(),
    )) as ServiceWorkerRegistration[];

    for (const r of registrations) {
        yield call(() => r.unregister());
    }

    location.reload();
}

export default function* app(): Generator {
    yield takeEvery(AppActionType.Reload, reload);
}
