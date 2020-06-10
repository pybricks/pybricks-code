// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { didFailToWrite } from '../actions/ble';
import {
    BootloaderConnectionFailureReason,
    didError,
    didFailToConnect,
} from '../actions/lwp3-bootloader';
import errorLog from './error-log';

test('bleDataDidFailToWrite', async () => {
    const saga = new AsyncSaga(errorLog);

    console.error = jest.fn();
    saga.put(didFailToWrite(0, new Error('test error')));
    expect(console.error).toHaveBeenCalledTimes(1);

    await saga.end();
});

test('bootloaderDidFailToConnect', async () => {
    const saga = new AsyncSaga(errorLog);

    console.debug = jest.fn();
    saga.put(didFailToConnect(BootloaderConnectionFailureReason.Canceled));
    expect(console.debug).toHaveBeenCalledTimes(1);

    console.error = jest.fn();
    saga.put(didFailToConnect(BootloaderConnectionFailureReason.Unknown));
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
