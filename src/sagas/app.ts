// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, put, takeEvery } from 'typed-redux-saga/macro';
import {
    AppActionType,
    AppCheckForUpdatesAction,
    AppReloadAction,
    didCheckForUpdate,
} from '../actions/app';

function* reload(action: AppReloadAction): Generator {
    yield* call(() => action.registration.unregister());
    location.reload();
}

function* checkForUpdate(action: AppCheckForUpdatesAction): Generator {
    yield* call(() => action.registration.update());
    const updateFound = action.registration.installing !== null;
    yield* put(didCheckForUpdate(updateFound));
}

export default function* app(): Generator {
    yield* takeEvery(AppActionType.Reload, reload);
    yield* takeEvery(AppActionType.CheckForUpdate, checkForUpdate);
}
