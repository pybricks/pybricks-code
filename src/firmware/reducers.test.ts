// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    FailToFinishReasonType,
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "flashing": false,
          "progress": null,
        }
    `);
});

test('flashing', () => {
    expect(reducers({ flashing: false } as State, didStart()).flashing).toBe(true);
    expect(reducers({ flashing: true } as State, didFinish()).flashing).toBe(false);
    expect(
        reducers(
            { flashing: true } as State,
            didFailToFinish(FailToFinishReasonType.TimedOut),
        ).flashing,
    ).toBe(false);
});

test('progress', () => {
    expect(reducers({ progress: 1 } as State, didStart()).progress).toBe(null);
    expect(reducers({ progress: null } as State, didProgress(1)).progress).toBe(1);
});
