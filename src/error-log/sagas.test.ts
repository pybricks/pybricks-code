// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { eventProtocolError } from '../ble-pybricks-service/actions';
import { didFailToWrite } from '../ble-uart/actions';
import {
    BleDeviceFailToConnectReasonType,
    didFailToConnect as bleDidFailToConnect,
} from '../ble/actions';
import { didFailToFetchList } from '../licenses/actions';
import {
    BootloaderConnectionFailureReason,
    didError,
    didFailToConnect,
} from '../lwp3-bootloader/actions';
import errorLog from './sagas';

test('bleDeviceDidFailToConnect', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();

    saga.put(
        bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.Canceled }),
    );
    expect(console.error).toHaveBeenCalledTimes(0);

    saga.put(
        bleDidFailToConnect({
            reason: BleDeviceFailToConnectReasonType.Unknown,
            err: new Error('test error'),
        }),
    );
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('bleDataDidFailToWrite', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(didFailToWrite(0, new Error('test error')));
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('eventProtocolError', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(eventProtocolError(new Error('test error')));
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('bootloaderDidFailToConnect', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(didFailToConnect(BootloaderConnectionFailureReason.Unknown, <Error>{}));
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('bootloaderDidError', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(didError(new Error('test error')));
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('licenseDidFailToFetch', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(
        didFailToFetchList(
            new Response(undefined, { status: 404, statusText: 'not found' }),
        ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});
