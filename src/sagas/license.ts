// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, put, select, takeEvery } from 'redux-saga/effects';
import { AppActionType } from '../actions/app';
import { didFetchList } from '../actions/license';
import { RootState } from '../reducers';
import { LicenseList } from '../reducers/license';

function* fetchLicenses(): Generator {
    const licenses = (yield select(
        (s: RootState) => s.license.list,
    )) as LicenseList | null;

    // if we already have license list, nothing to do
    if (licenses !== null) {
        return;
    }

    const response = (yield call(() => fetch('static/oss-licenses.json'))) as Response;
    if (!response.ok || response.body === null) {
        // TODO: dispatch an action to notify user
        console.error('failed to fetch oss-licenses.json', response.statusText);
        return;
    }

    const list = (yield call(() => response.json())) as LicenseList;
    yield put(didFetchList(list));
}

export default function* (): Generator {
    yield takeEvery(AppActionType.OpenLicenseDialog, fetchLicenses);
}
