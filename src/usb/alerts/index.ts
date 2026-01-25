// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 The Pybricks Authors

import { accessDenied } from './AccessDenied';
import { alreadyInUse } from './AlreadyInUse';
import { newPybricksProfile } from './NewPybricksProfile';
import { noWebUsb } from './NoWebUsb';
import { oldFirmware } from './OldFirmware';

// gathers all of the alert creation functions for passing up to the top level
export default {
    accessDenied,
    alreadyInUse,
    newPybricksProfile,
    noWebUsb,
    oldFirmware,
};
