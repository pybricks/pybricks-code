// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, takeEvery } from 'typed-redux-saga/macro';
import { AppActionType, AppReloadAction } from '../actions/app';

function* reload(action: AppReloadAction): Generator {
    yield* call(() => action.registration.unregister());
    location.reload();
}

export default function* app(): Generator {
    yield* takeEvery(AppActionType.Reload, reload);
}
