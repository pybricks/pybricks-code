// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2026 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    FailToFinishReasonType,
    didFailToFinish,
    didFinish,
    didStart,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "dfuWindowsDriverInstallDialog": {
            "isOpen": false,
          },
          "flashing": false,
          "installPybricksDialog": {
            "isOpen": false,
          },
          "isFirmwareFlashEV3InProgress": false,
          "isFirmwareFlashUsbDfuInProgress": false,
          "isFirmwareRestoreOfficialDfuInProgress": false,
          "restoreOfficialDialog": {
            "isOpen": false,
          },
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
