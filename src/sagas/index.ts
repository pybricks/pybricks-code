// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { all } from 'redux-saga/effects';
import bleUart from './ble-uart';
import editor from './editor';
import errorLog from './error-log';
import flashFirmware from './flash-firmare';
import hub from './hub';
import bootloader from './lwp3-bootloader';
import mpy from './mpy';
import terminal from './terminal';

/* istanbul ignore next */
export default function* (): Generator {
    yield all([
        bleUart(),
        bootloader(),
        editor(),
        errorLog(),
        flashFirmware(),
        hub(),
        mpy(),
        terminal(),
    ]);
}
