// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { takeEvery } from 'redux-saga/effects';
import {
    BleDeviceActionType,
    BleDeviceDidFailToConnectAction,
    BleDeviceFailToConnectReasonType,
} from '../actions/ble';
import { BleUartActionType, BleUartDidFailToWriteAction } from '../actions/ble-uart';
import { LicenseActionType, LicenseDidFailToFetchListAction } from '../actions/license';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionDidErrorAction,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderConnectionFailureReason,
} from '../actions/lwp3-bootloader';

function bleDeviceDidFailToConnect(action: BleDeviceDidFailToConnectAction): void {
    if (action.reason === BleDeviceFailToConnectReasonType.Unknown) {
        console.error(action.err);
    }
}

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

function licenseDidFailToFetch(action: LicenseDidFailToFetchListAction): void {
    console.error(`Failed to fetch licenses: ${action.reason.statusText}`);
}

export default function* (): Generator {
    yield takeEvery(BleDeviceActionType.DidFailToConnect, bleDeviceDidFailToConnect);
    yield takeEvery(BleUartActionType.DidFailToWrite, bleDataDidFailToWrite);
    yield takeEvery(
        BootloaderConnectionActionType.DidFailToConnect,
        bootloaderDidFailToConnect,
    );
    yield takeEvery(BootloaderConnectionActionType.DidError, bootloaderDidError);
    yield takeEvery(LicenseActionType.DidFailToFetchList, licenseDidFailToFetch);
}
