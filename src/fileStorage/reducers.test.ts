// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Action } from '../actions';
import {
    fileStorageDidChangeItem,
    fileStorageDidInitialize,
    fileStorageDidRemoveItem,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as Action)).toMatchInlineSnapshot(`
        Object {
          "fileNames": Set {},
          "isInitialized": false,
        }
    `);
});

test('isInitialized', () => {
    expect(
        reducers({ isInitialized: false } as State, fileStorageDidInitialize())
            .isInitialized,
    ).toBeTruthy();
});

test('fileNames', () => {
    const testFileName = 'test.file';

    // if item is not in set, add it
    expect(
        reducers(
            { fileNames: new Set() } as State,
            fileStorageDidChangeItem(testFileName),
        ).fileNames,
    ).toEqual(new Set([testFileName]));

    // if item is already in set, there should not be duplicates
    expect(
        reducers(
            { fileNames: new Set([testFileName]) } as State,
            fileStorageDidChangeItem(testFileName),
        ).fileNames,
    ).toEqual(new Set([testFileName]));

    // if item is in set, it should be removed
    expect(
        reducers(
            { fileNames: new Set([testFileName]) } as State,
            fileStorageDidRemoveItem(testFileName),
        ).fileNames,
    ).not.toContain(testFileName);
});
