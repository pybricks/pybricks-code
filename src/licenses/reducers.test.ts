// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AnyAction } from 'redux';
import { didFetchList, select } from './actions';
import reducers, { LicenseInfo, LicenseList } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "list": null,
          "selected": null,
        }
    `);
});

test('list', () => {
    const list = [] as LicenseList;
    expect(reducers({ list: null } as State, didFetchList(list)).list).toBe(list);
});

test('selected', () => {
    const info = {} as LicenseInfo;
    expect(reducers({ selected: null } as State, select(info)).selected).toBe(info);
});
