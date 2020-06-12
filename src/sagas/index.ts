// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { all, put } from 'redux-saga/effects';
import { startup } from '../actions/app';
import app from './app';
import bleUart from './ble-uart';
import editor from './editor';
import errorLog from './error-log';
import flashFirmware from './flash-firmware';
import hub from './hub';
import bootloader from './lwp3-bootloader';
import mpy from './mpy';
import terminal from './terminal';

/* istanbul ignore next */
export default function* (): Generator {
    yield all([
        app(),
        bleUart(),
        bootloader(),
        editor(),
        errorLog(),
        flashFirmware(),
        hub(),
        mpy(),
        terminal(),
        put(startup()),
    ]);
}
