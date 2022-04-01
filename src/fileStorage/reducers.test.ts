// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    fileStorageDidAddItem,
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

    // adding appends an item
    expect(
        reducers(
            { fileNames: [] as ReadonlyArray<string> } as State,
            fileStorageDidAddItem(testFileName),
        ).fileNames,
    ).toEqual([testFileName]);

    // changing does nothing
    expect(
        reducers(
            { fileNames: [testFileName] as ReadonlyArray<string> } as State,
            fileStorageDidChangeItem(testFileName),
        ).fileNames,
    ).toEqual([testFileName]);

    // removing deletes an item
    expect(
        reducers(
            { fileNames: [testFileName] as ReadonlyArray<string> } as State,
            fileStorageDidRemoveItem(testFileName),
        ).fileNames,
    ).not.toContain(testFileName);
});
