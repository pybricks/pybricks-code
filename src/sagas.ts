// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { all, put } from 'typed-redux-saga/macro';
import { didStart } from './app/actions';
import app from './app/sagas';
import blePybricksService from './ble-pybricks-service/sagas';
import ble from './ble/sagas';
import { EditorType } from './editor/Editor';
import editor from './editor/sagas';
import errorLog from './error-log/sagas';
import explorer from './explorer/sagas';
import fileStorage from './fileStorage/sagas';
import flashFirmware, { FirmwareSagaContext } from './firmware/sagas';
import hub from './hub/sagas';
import lwp3BootloaderProtocol from './lwp3-bootloader/sagas';
import lwp3BootloaderBle from './lwp3-bootloader/sagas-ble';
import mpy from './mpy/sagas';
import notifications, { NotificationSagaContext } from './notifications/sagas';
import terminal, { TerminalSagaContext } from './terminal/sagas';

/* istanbul ignore next */
export default function* (): Generator {
    yield* all([
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
        put(didStart()),
    ]);
}

/**
 * Combined type for all saga contexts.
 */
export type RootSagaContext = { editor: EditorType } & FirmwareSagaContext &
    NotificationSagaContext &
    TerminalSagaContext;
