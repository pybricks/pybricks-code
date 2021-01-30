// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Ace } from 'ace-builds';
import { Action } from '../actions';
import { setEditSession } from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as Action)).toMatchInlineSnapshot(`
        Object {
          "current": null,
        }
    `);
});

test('current', () => {
    const session = {} as Ace.EditSession;
    expect(reducers({ current: null } as State, setEditSession(session)).current).toBe(
        session,
    );
    expect(
        reducers({ current: session } as State, setEditSession(undefined)).current,
    ).toBe(null);
});
