// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2026 The Pybricks Authors

import { AnyAction } from 'redux';

import reducers from './reducers';

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "dfuWindowsDriverInstallDialog": {
            "isOpen": false,
          },
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
