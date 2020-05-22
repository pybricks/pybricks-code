// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { all } from 'redux-saga/effects';
import bootloader from './bootloader';

/* istanbul ignore next */
export default function* (): Generator {
    yield all([bootloader()]);
}
