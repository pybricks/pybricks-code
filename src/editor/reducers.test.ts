// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { AnyAction } from 'redux';
import { didSetEditSession, setEditSession } from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "current": null,
        }
    `);
});

test('current', () => {
    const session = {} as monaco.editor.ICodeEditor;

    // setEditSession doesn't change the state
    expect(reducers({ current: null } as State, setEditSession(session)).current).toBe(
        null,
    );

    // only didSetEditSession changes the state
    expect(
        reducers({ current: null } as State, didSetEditSession(session)).current,
    ).toBe(session);

    expect(
        reducers({ current: session } as State, didSetEditSession(undefined)).current,
    ).toBe(null);
});
