// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

// Tests for license sagas.

import { AsyncSaga, delay } from '../../test';
import { didFailToFetchList, didFetchList, fetchList } from './actions';
import { LicenseList } from './reducers';
import license from './sagas';

afterAll(() => {
    jest.restoreAllMocks();
});

describe('fetchLicenses', () => {
    test('first call', async () => {
        const testLicenseList: LicenseList = [];
        const saga = new AsyncSaga(license, { licenses: { list: null } });

        jest.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify(testLicenseList)),
        );

        // initially, license list starts as null, so fetch is called to get
        // the list
        saga.put(fetchList());

        const action = await saga.take();
        expect(action).toEqual(didFetchList(testLicenseList));

        await saga.end();
    });
    test('second call', async () => {
        const testLicenseList: LicenseList = [];
        const saga = new AsyncSaga(license, { licenses: { list: testLicenseList } });

        jest.spyOn(globalThis, 'fetch').mockRejectedValue(
            'fetch () should not have been called',
        );

        // after we have the list, we don't fetch it again since it will
        // always be the same list
        saga.put(fetchList());

        // have to yield to be sure fetch call would have taken place on error
        await delay(0);

        await saga.end();
    });
    test('failed fetch', async () => {
        const failResponse = new Response(undefined, { status: 404 });
        const saga = new AsyncSaga(license, { licenses: { list: null } });

        jest.spyOn(globalThis, 'fetch').mockResolvedValue(failResponse);

        saga.put(fetchList());

        const action = await saga.take();
        expect(action).toEqual(didFailToFetchList(failResponse));

        await saga.end();
    });
});
