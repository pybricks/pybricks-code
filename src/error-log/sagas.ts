// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { takeEvery } from 'typed-redux-saga/macro';
import {
    BlePybricksServiceEventActionType,
    BlePybricksServiceEventProtocolErrorAction,
} from '../ble-pybricks-service/actions';
import { BleUartActionType, BleUartDidFailToWriteAction } from '../ble-uart/actions';
import {
    BleDeviceActionType,
    BleDeviceDidFailToConnectAction,
    BleDeviceFailToConnectReasonType,
} from '../ble/actions';
import {
    LicenseActionType,
    LicenseDidFailToFetchListAction,
} from '../licenses/actions';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionDidErrorAction,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderConnectionFailureReason,
} from '../lwp3-bootloader/actions';

function bleDeviceDidFailToConnect(action: BleDeviceDidFailToConnectAction): void {
    if (action.reason === BleDeviceFailToConnectReasonType.Unknown) {
        console.error(action.err);
    }
}

function pybricksProtocolError(
    action: BlePybricksServiceEventProtocolErrorAction,
): void {
    console.error(action.err);
}

function bleDataDidFailToWrite(action: BleUartDidFailToWriteAction): void {
    console.error(action.err);
}

function bootloaderDidFailToConnect(
    action: BootloaderConnectionDidFailToConnectAction,
): void {
    if (action.reason === BootloaderConnectionFailureReason.Unknown) {
        console.error(action.err);
    }
}

function bootloaderDidError(action: BootloaderConnectionDidErrorAction): void {
    console.error(action.err);
}

function licenseDidFailToFetch(action: LicenseDidFailToFetchListAction): void {
    console.error(`Failed to fetch licenses: ${action.reason.statusText}`);
}

export default function* (): Generator {
    yield* takeEvery(BleDeviceActionType.DidFailToConnect, bleDeviceDidFailToConnect);
    yield* takeEvery(
        BlePybricksServiceEventActionType.ProtocolError,
        pybricksProtocolError,
    );
    yield* takeEvery(BleUartActionType.DidFailToWrite, bleDataDidFailToWrite);
    yield* takeEvery(
        BootloaderConnectionActionType.DidFailToConnect,
        bootloaderDidFailToConnect,
    );
    yield* takeEvery(BootloaderConnectionActionType.DidError, bootloaderDidError);
    yield* takeEvery(LicenseActionType.DidFailToFetchList, licenseDidFailToFetch);
}
