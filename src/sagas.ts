// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { eventChannel } from 'redux-saga';
import { all, spawn, take } from 'typed-redux-saga/macro';
import alerts, { AlertsSagaContext } from './alerts/sagas';
import app from './app/sagas';
import blePybricksService from './ble-pybricks-service/sagas';
import ble from './ble/sagas';
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

/**
 * Listens to the 'pb-lazy-saga' event to spawn sagas from a React.lazy() initializer.
 */
function* lazySagas(): Generator {
    const chan = eventChannel<CustomEvent<{ saga: () => void }>>((emit) => {
        window.addEventListener('pb-lazy-saga', emit as EventListener);
        return () => window.removeEventListener('pb-lazy-saga', emit as EventListener);
    });

    try {
        for (;;) {
            const event = yield* take(chan);
            yield* spawn(event.detail.saga);
        }
    } finally {
        chan.close();
    }
}

/* istanbul ignore next */
export default function* (): Generator {
    yield* all([
        alerts(),
        app(),
        blePybricksService(),
        ble(),
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
        lazySagas(),
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
