// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { all, put } from 'typed-redux-saga/macro';
import { didStart } from './app/actions';
import app from './app/sagas';
import blePybricksService from './ble-pybricks-service/sagas';
import bleUart from './ble-uart/sagas';
import editor from './editor/sagas';
import errorLog from './error-log/sagas';
import flashFirmware from './firmware/sagas';
import hub from './hub/sagas';
import licenses from './licenses/sagas';
import lwp3BootloaderProtocol from './lwp3-bootloader/sagas';
import lwp3BootloaderBle from './lwp3-bootloader/sagas-ble';
import mpy from './mpy/sagas';
import notifications from './notifications/sagas';
import settings from './settings/sagas';
import terminal from './terminal/sagas';

/* istanbul ignore next */
export default function* (): Generator {
    yield* all([
        app(),
        blePybricksService(),
        bleUart(),
        lwp3BootloaderBle(),
        lwp3BootloaderProtocol(),
        editor(),
        errorLog(),
        flashFirmware(),
        hub(),
        licenses(),
        mpy(),
        notifications(),
        settings(),
        terminal(),
        put(didStart()),
    ]);
}
