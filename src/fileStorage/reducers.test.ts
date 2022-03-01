// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    fileStorageDidChangeItem,
    fileStorageDidInitialize,
    fileStorageDidRemoveItem,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "fileNames": Array [],
          "isInitialized": false,
        }
    `);
});

test('isInitialized', () => {
    expect(
        reducers({ isInitialized: false } as State, fileStorageDidInitialize([]))
            .isInitialized,
    ).toBeTruthy();
});

test('fileNames', () => {
    const testFileName = 'test.file';

    // initialization populates file list
    expect(
        reducers(
            { fileNames: [] as ReadonlyArray<string> } as State,
            fileStorageDidInitialize([testFileName]),
        ).fileNames,
    ).toEqual([testFileName]);

    // if item is not in set, add it
    expect(
        reducers(
            { fileNames: [] as ReadonlyArray<string> } as State,
            fileStorageDidChangeItem(testFileName),
        ).fileNames,
    ).toEqual([testFileName]);

    // if item is already in set, there should not be duplicates
    expect(
        reducers(
            { fileNames: [testFileName] as ReadonlyArray<string> } as State,
            fileStorageDidChangeItem(testFileName),
        ).fileNames,
    ).toEqual([testFileName]);

    // if item is in set, it should be removed
    expect(
        reducers(
            { fileNames: [testFileName] as ReadonlyArray<string> } as State,
            fileStorageDidRemoveItem(testFileName),
        ).fileNames,
    ).not.toContain(testFileName);
});
