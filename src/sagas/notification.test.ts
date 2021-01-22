// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { IToaster } from '@blueprintjs/core';
import { AsyncSaga } from '../../test';
import { Action } from '../actions';
import {
    BleDeviceFailToConnectReasonType,
    didFailToConnect as bleDidFailToConnect,
} from '../actions/ble';
import { storageChanged } from '../actions/editor';
import {
    BootloaderConnectionFailureReason,
    didFailToConnect as bootloaderDidFailToConnect,
} from '../actions/lwp3-bootloader';
import { didCompile, didFailToCompile } from '../actions/mpy';
import { add } from '../actions/notification';
import { didSucceed, didUpdate } from '../actions/service-worker';
import { MessageId } from '../components/notification-i18n';
import notification from './notification';

test.each([
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoWebBluetooth }),
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoGatt }),
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoService }),
    bleDidFailToConnect({
        reason: BleDeviceFailToConnectReasonType.Unknown,
        err: { name: 'test', message: 'unknown' },
    }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Unknown, <Error>{
        message: 'test',
    }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.NoWebBluetooth),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.GattServiceNotFound),
    storageChanged('test'),
    didFailToCompile(['reason']),
    add('warning', 'message'),
    add('error', 'message', 'url'),
    didUpdate({} as ServiceWorkerRegistration),
])('actions that should show notification: %o', async (action: Action) => {
    const getToasts = jest.fn().mockReturnValue([]);
    const show = jest.fn();
    const dismiss = jest.fn();
    const clear = jest.fn();

    const toaster: IToaster = {
        getToasts,
        show,
        dismiss,
        clear,
    };

    const saga = new AsyncSaga(notification, {}, { notification: { toaster } });

    saga.put(action);

    expect(show).toBeCalled();
    expect(dismiss).not.toBeCalled();
    expect(clear).not.toBeCalled();

    await saga.end();
});

test.each([
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.Canceled }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Canceled),
    didSucceed({} as ServiceWorkerRegistration),
])('actions that should not show a notification: %o', async (action: Action) => {
    const getToasts = jest.fn().mockReturnValue([]);
    const show = jest.fn();
    const dismiss = jest.fn();
    const clear = jest.fn();

    const toaster: IToaster = {
        getToasts,
        show,
        dismiss,
        clear,
    };

    const saga = new AsyncSaga(notification, {}, { notification: { toaster } });

    saga.put(action);

    expect(getToasts).not.toBeCalled();
    expect(show).not.toBeCalled();
    expect(dismiss).not.toBeCalled();
    expect(clear).not.toBeCalled();

    await saga.end();
});

test.each([[didCompile(new Uint8Array()), MessageId.MpyError]])(
    'actions that should close a notification: %o',
    async (action: Action, key: string) => {
        const getToasts = jest.fn().mockReturnValue([]);
        const show = jest.fn();
        const dismiss = jest.fn();
        const clear = jest.fn();

        const toaster: IToaster = {
            getToasts,
            show,
            dismiss,
            clear,
        };

        const saga = new AsyncSaga(notification, {}, { notification: { toaster } });

        saga.put(action);

        expect(show).not.toBeCalled();
        expect(dismiss).toBeCalledWith(key);
        expect(clear).not.toBeCalled();

        await saga.end();
    },
);
