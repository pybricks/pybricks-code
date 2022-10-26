// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { all } from 'typed-redux-saga/macro';
import alerts, { AlertsSagaContext } from './alerts/sagas';
import app from './app/sagas';
import blePybricksService from './ble-pybricks-service/sagas';
import ble from './ble/sagas';
import editor from './editor/sagas';
import errorLog from './error-log/sagas';
import explorer from './explorer/sagas';
import fileStorage, { FileStorageSageContext } from './fileStorage/sagas';
import flashFirmware from './firmware/sagas';
import hub from './hub/sagas';
import lwp3BootloaderProtocol from './lwp3-bootloader/sagas';
import lwp3BootloaderBle from './lwp3-bootloader/sagas-ble';
import mpy from './mpy/sagas';
import notifications from './notifications/sagas';
import terminal, { TerminalSagaContext } from './terminal/sagas';

/* istanbul ignore next */
export default function* (): Generator {
    yield* all([
        alerts(),
        app(),
        blePybricksService(),
        ble(),
        editor(),
        fileStorage(),
        lwp3BootloaderBle(),
        lwp3BootloaderProtocol(),
        errorLog(),
        explorer(),
        flashFirmware(),
        hub(),
        mpy(),
        notifications(),
        terminal(),
    ]);
}

/**
 * Combined type for all saga contexts.
 */
export type RootSagaContext = {
    nextMessageId: () => number;
} & AlertsSagaContext &
    FileStorageSageContext &
    TerminalSagaContext;
