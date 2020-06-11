// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { takeEvery } from 'redux-saga/effects';
import { BleUartActionType, BleUartDidFailToWriteAction } from '../actions/ble-uart';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionDidErrorAction,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderConnectionFailureReason,
} from '../actions/lwp3-bootloader';

function bleDataDidFailToWrite(action: BleUartDidFailToWriteAction): void {
    console.error(action.err);
}

function bootloaderDidFailToConnect(
    action: BootloaderConnectionDidFailToConnectAction,
): void {
    if (action.reason === BootloaderConnectionFailureReason.Unknown) {
        console.error(action.err);
    } else {
        console.debug(action.err);
    }
}

function bootloaderDidError(action: BootloaderConnectionDidErrorAction): void {
    console.error(action.err);
}

export default function* (): Generator {
    yield takeEvery(BleUartActionType.DidFailToWrite, bleDataDidFailToWrite);
    yield takeEvery(
        BootloaderConnectionActionType.DidFailToConnect,
        bootloaderDidFailToConnect,
    );
    yield takeEvery(BootloaderConnectionActionType.DidError, bootloaderDidError);
}
