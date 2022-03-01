// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { IToaster } from '@blueprintjs/core';
import {
    FirmwareReaderError,
    FirmwareReaderErrorCode,
    firmwareVersion,
} from '@pybricks/firmware';
import { AnyAction } from 'redux';
import { AsyncSaga } from '../../test';
import { didCheckForUpdate } from '../app/actions';
import { bleDIServiceDidReceiveFirmwareRevision } from '../ble-device-info-service/actions';
import {
    BleDeviceFailToConnectReasonType,
    didFailToConnect as bleDidFailToConnect,
} from '../ble/actions';
import { didFailToSaveAs } from '../editor/actions';
import {
    fileStorageDidFailToExportFile,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToWriteFile,
} from '../fileStorage/actions';
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
    bleDIServiceDidReceiveFirmwareRevision('3.0.0'),
    didFailToSaveAs(new DOMException('test message', 'NotAllowedError')),
    fileStorageDidFailToInitialize(new Error('test error')),
    fileStorageDidFailToReadFile('test.file', new Error('test error')),
    fileStorageDidFailToWriteFile('test.file', new Error('test error')),
    fileStorageDidFailToExportFile('test.file', new Error('test error')),
])('actions that should show notification: %o', async (action: AnyAction) => {
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
    bleDIServiceDidReceiveFirmwareRevision(firmwareVersion),
    didFailToSaveAs(new DOMException('test message', 'AbortError')),
    fileStorageDidFailToExportFile(
        'test.file',
        new DOMException('test message', 'AbortError'),
    ),
])('actions that should not show a notification: %o', async (action: AnyAction) => {
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
    async (action: AnyAction, key: string) => {
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
