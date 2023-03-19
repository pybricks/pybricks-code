// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { bluetoothNotAvailable } from './BluetoothNotAvailable';
import { failedToConnect } from './FailedToConnect';
import { missingService } from './MissingService';
import { noGatt } from './NoGatt';
import { noHub } from './NoHub';
import { noWebBluetooth } from './NoWebBluetooth';
import { oldFirmware } from './OldFirmware';

// gathers all of the alert creation functions for passing up to the top level
export default {
    bluetoothNotAvailable,
    failedToConnect,
    missingService,
    noGatt,
    noHub,
    noWebBluetooth,
    oldFirmware,
};
