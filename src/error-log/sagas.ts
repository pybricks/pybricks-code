// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { takeEvery } from 'typed-redux-saga/macro';
import { didFailToWrite as bleUartDidFailToWrite } from '../ble-nordic-uart-service/actions';
import { eventProtocolError as pybricksEventProtocolError } from '../ble-pybricks-service/actions';
import { fileStorageDidFailToStoreTextFileValue } from '../fileStorage/actions';
import {
    BootloaderConnectionFailureReason,
    didError as bootloaderDidError,
    didFailToConnect as bootloaderDidFailToConnect,
} from '../lwp3-bootloader/actions';

function handlePybricksEventProtocolError(
    action: ReturnType<typeof pybricksEventProtocolError>,
): void {
    console.error(action.error);
}

function handleBleUartDidFailToWrite(
    action: ReturnType<typeof bleUartDidFailToWrite>,
): void {
    console.error(action.error);
}

function handleBootloaderDidFailToConnect(
    action: ReturnType<typeof bootloaderDidFailToConnect>,
): void {
    if (action.reason === BootloaderConnectionFailureReason.Unknown) {
        console.error(action.err);
    }
}

function handleBootloaderDidError(action: ReturnType<typeof bootloaderDidError>): void {
    console.error(action.error);
}

function handleFileStorageDidFailToStoreTextFileValue(
    action: ReturnType<typeof fileStorageDidFailToStoreTextFileValue>,
): void {
    console.error(action.error);
}

export default function* (): Generator {
    yield* takeEvery(pybricksEventProtocolError, handlePybricksEventProtocolError);
    yield* takeEvery(bleUartDidFailToWrite, handleBleUartDidFailToWrite);
    yield* takeEvery(bootloaderDidFailToConnect, handleBootloaderDidFailToConnect);
    yield* takeEvery(bootloaderDidError, handleBootloaderDidError);
    yield* takeEvery(
        fileStorageDidFailToStoreTextFileValue,
        handleFileStorageDidFailToStoreTextFileValue,
    );
}
