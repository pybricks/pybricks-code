// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { newPybricksProfile } from './NewPybricksProfile';
import { noWebUsb } from './NoWebUsb';
import { oldFirmware } from './OldFirmware';

// gathers all of the alert creation functions for passing up to the top level
export default {
    newPybricksProfile,
    noWebUsb,
    oldFirmware,
};
