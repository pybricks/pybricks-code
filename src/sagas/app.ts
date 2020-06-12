// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: sagas/app.ts
// Manages the application lifecycle.

import { put, select, takeEvery } from 'redux-saga/effects';
import {
    AppActionType,
    AppStartupAction,
    AppToggleDocsAction,
    toggleDocs,
} from '../actions/app';
import { RootState } from '../reducers';

function* handleStartup(_action: AppStartupAction): Generator {
    const showDocs = localStorage.getItem('showDocs');
    if (showDocs === null ? window.innerWidth >= 1024 : showDocs === 'true') {
        yield put(toggleDocs());
    }
}

function* storeDocsState(_action: AppToggleDocsAction): Generator {
    const showDocs = (yield select((s: RootState) => s.app.showDocs)) as boolean;
    localStorage.setItem('showDocs', String(showDocs));
}

export default function* (): Generator {
    yield takeEvery(AppActionType.Startup, handleStartup);
    yield takeEvery(AppActionType.ToggleDocs, storeDocsState);
}
