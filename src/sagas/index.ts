// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { all } from 'redux-saga/effects';
import editor from './editor';
import bootloader from './lwp3-bootloader';
import mpy from './mpy';

/* istanbul ignore next */
export default function* (): Generator {
    yield all([bootloader(), editor(), mpy()]);
}
