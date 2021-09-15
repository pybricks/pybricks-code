// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { IToaster } from '@blueprintjs/core';
import {
    FirmwareReaderError,
    FirmwareReaderErrorCode,
    firmwareVersion,
} from '@pybricks/firmware';
import { AsyncSaga } from '../../test';
import { Action } from '../actions';
import { didCheckForUpdate } from '../app/actions';
import {
    BleDeviceFailToConnectReasonType,
    didFailToConnect as bleDidFailToConnect,
    didConnect,
} from '../ble/actions';
import { storageChanged } from '../editor/actions';
import {
    FailToFinishReasonType,
    HubError,
    MetadataProblem,
    didFailToFinish,
} from '../firmware/actions';
import {
    BootloaderConnectionFailureReason,
    didFailToConnect as bootloaderDidFailToConnect,
} from '../lwp3-bootloader/actions';
import { didCompile, didFailToCompile } from '../mpy/actions';
import { didSucceed, didUpdate } from '../service-worker/actions';
import { add } from './actions';
import { MessageId } from './i18n';
import notification from './sagas';

test.each([
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoWebBluetooth }),
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoBluetooth }),
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoGatt }),
    bleDidFailToConnect({
        reason: BleDeviceFailToConnectReasonType.NoDeviceInfoService,
    }),
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.NoPybricksService }),
    bleDidFailToConnect({
        reason: BleDeviceFailToConnectReasonType.Unknown,
        err: { name: 'test', message: 'unknown' },
    }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Unknown, <Error>{
        message: 'test',
    }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.NoWebBluetooth),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.NoBluetooth),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.GattServiceNotFound),
    storageChanged('test'),
    didFailToCompile(['reason']),
    add('warning', 'message'),
    add('error', 'message', 'url'),
    didUpdate({} as ServiceWorkerRegistration),
    didFailToFinish(FailToFinishReasonType.TimedOut),
    didFailToFinish(
        FailToFinishReasonType.BleError,
        new DOMException('test error', 'NetworkError'),
    ),
    didFailToFinish(FailToFinishReasonType.Disconnected),
    didFailToFinish(FailToFinishReasonType.HubError, HubError.UnknownCommand),
    didFailToFinish(FailToFinishReasonType.NoFirmware),
    didFailToFinish(FailToFinishReasonType.DeviceMismatch),
    didFailToFinish(
        FailToFinishReasonType.FailedToFetch,
        new Response(undefined, { status: 404 }),
    ),
    didFailToFinish(
        FailToFinishReasonType.ZipError,
        new FirmwareReaderError(FirmwareReaderErrorCode.ZipError),
    ),
    didFailToFinish(
        FailToFinishReasonType.BadMetadata,
        'device-id',
        MetadataProblem.NotSupported,
    ),
    didFailToFinish(FailToFinishReasonType.FailedToCompile),
    didFailToFinish(FailToFinishReasonType.FirmwareSize),
    didFailToFinish(FailToFinishReasonType.Unknown, new Error('test error')),
    didCheckForUpdate(false),
    didConnect('3.0.0'),
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
    didFailToFinish(FailToFinishReasonType.FailedToConnect),
    didSucceed({} as ServiceWorkerRegistration),
    didCheckForUpdate(true),
    didConnect(firmwareVersion),
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
