// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, put, select, takeEvery } from 'typed-redux-saga/macro';
import { AppActionType } from '../actions/app';
import { didFailToFetchList, didFetchList } from '../actions/license';
import { RootState } from '../reducers';

function* fetchLicenses(): Generator {
    const licenses = yield* select((s: RootState) => s.license.list);

    // if we already have license list, nothing to do
    if (licenses !== null) {
        return;
    }

    const response = yield* call(() => fetch('static/oss-licenses.json'));
    if (!response.ok || response.body === null) {
        yield* put(didFailToFetchList(response));
        return;
    }

    const list = yield* call(() => response.json());
    yield* put(didFetchList(list));
}

export default function* (): Generator {
    yield* takeEvery(AppActionType.OpenLicenseDialog, fetchLicenses);
}
