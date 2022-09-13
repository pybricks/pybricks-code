// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnyAction } from 'redux';
import { fileStorageDidInitialize } from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
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
