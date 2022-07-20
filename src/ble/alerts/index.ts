// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { bluetoothNotAvailable } from './BluetoothNotAvailable';
import { missingService } from './MissingService';
import { noGatt } from './NoGatt';
import { noHub } from './NoHub';
import { noWebBluetooth } from './NoWebBluetooth';
import { oldFirmware } from './OldFirmware';

// gathers all of the alert creation functions for passing up to the top level
export default {
    bluetoothNotAvailable,
    missingService,
    noGatt,
    noHub,
    noWebBluetooth,
    oldFirmware,
};
