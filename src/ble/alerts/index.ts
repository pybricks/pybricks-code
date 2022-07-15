// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { bluetoothNotAvailable } from './BluetoothNotAvailable';
import { noWebBluetooth } from './NoWebBluetooth';

// gathers all of the alert creation functions for passing up to the top level
export default { bluetoothNotAvailable, noWebBluetooth };
