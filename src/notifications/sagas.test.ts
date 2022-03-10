// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { IToaster } from '@blueprintjs/core';
import {
    FirmwareReaderError,
    FirmwareReaderErrorCode,
    firmwareVersion,
} from '@pybricks/firmware';
import { I18nManager } from '@shopify/react-i18n';
import { AnyAction } from 'redux';
import { AsyncSaga } from '../../test';
import { appDidCheckForUpdate } from '../app/actions';
import { bleDIServiceDidReceiveFirmwareRevision } from '../ble-device-info-service/actions';
import {
    BleDeviceFailToConnectReasonType,
    didFailToConnect as bleDidFailToConnect,
} from '../ble/actions';
import { didFailToSaveAs } from '../editor/actions';
import { explorerDeleteFile } from '../explorer/actions';
import {
    fileStorageDeleteFile,
    fileStorageDidFailToArchiveAllFiles,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToExportFile,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidRemoveItem,
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
import {
    serviceWorkerDidSucceed,
    serviceWorkerDidUpdate,
} from '../service-worker/actions';
import * as I18nToaster from './I18nToaster';
import { add } from './actions';
import { MessageId } from './i18n';
import notification from './sagas';

function createTestToasterSaga(): { toaster: IToaster; saga: AsyncSaga } {
    const i18n = new I18nManager({ locale: 'en' });
    const toaster = I18nToaster.create(i18n);

    jest.spyOn(toaster, 'clear');
    jest.spyOn(toaster, 'dismiss');
    jest.spyOn(toaster, 'getToasts');
    jest.spyOn(toaster, 'show');

    const saga = new AsyncSaga(notification, {}, { notification: { toaster } });

    return { toaster, saga };
}

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
    serviceWorkerDidUpdate(),
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
    appDidCheckForUpdate(false),
    bleDIServiceDidReceiveFirmwareRevision('3.0.0'),
    didFailToSaveAs(new DOMException('test message', 'NotAllowedError')),
    fileStorageDidFailToInitialize(new Error('test error')),
    fileStorageDidFailToReadFile('test.file', new Error('test error')),
    fileStorageDidFailToWriteFile('test.file', new Error('test error')),
    fileStorageDidFailToDeleteFile('test.file', new Error('test error')),
    fileStorageDidFailToExportFile('test.file', new Error('test error')),
    fileStorageDidFailToArchiveAllFiles(new Error('test error')),
])('actions that should show notification: %o', async (action: AnyAction) => {
    const { toaster, saga } = createTestToasterSaga();

    saga.put(action);

    expect(toaster.show).toBeCalled();
    expect(toaster.dismiss).not.toBeCalled();
    expect(toaster.clear).not.toBeCalled();

    await saga.end();
});

test.each([
    bleDidFailToConnect({ reason: BleDeviceFailToConnectReasonType.Canceled }),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Canceled),
    didFailToFinish(FailToFinishReasonType.FailedToConnect),
    serviceWorkerDidSucceed(),
    appDidCheckForUpdate(true),
    bleDIServiceDidReceiveFirmwareRevision(firmwareVersion),
    didFailToSaveAs(new DOMException('test message', 'AbortError')),
    fileStorageDidFailToExportFile(
        'test.file',
        new DOMException('test message', 'AbortError'),
    ),
    fileStorageDidFailToArchiveAllFiles(new DOMException('test message', 'AbortError')),
])('actions that should not show a notification: %o', async (action: AnyAction) => {
    const { toaster, saga } = createTestToasterSaga();

    saga.put(action);

    expect(toaster.getToasts).not.toBeCalled();
    expect(toaster.show).not.toBeCalled();
    expect(toaster.dismiss).not.toBeCalled();
    expect(toaster.clear).not.toBeCalled();

    await saga.end();
});

test.each([[didCompile(new Uint8Array()), MessageId.MpyError]])(
    'actions that should close a notification: %o',
    async (action: AnyAction, key: string) => {
        const { toaster, saga } = createTestToasterSaga();

        saga.put(action);

        expect(toaster.show).not.toBeCalled();
        expect(toaster.dismiss).toBeCalledWith(key);
        expect(toaster.clear).not.toBeCalled();

        await saga.end();
    },
);

describe('delete file saga', () => {
    it('should not delete the file if the user closes the notification', async () => {
        const { toaster, saga } = createTestToasterSaga();

        saga.put(explorerDeleteFile('test.file'));

        toaster.dismiss(MessageId.ExplorerDeleteFileMessage);

        await saga.end();
    });

    it('should delete the file if the user clicks the delete button', async () => {
        const { toaster, saga } = createTestToasterSaga();

        saga.put(explorerDeleteFile('test.file'));

        const toast = toaster
            .getToasts()
            .find((t) => t.key === MessageId.ExplorerDeleteFileMessage);

        expect(toast).toBeDefined();
        expect(toast?.action).toBeDefined();
        expect(toast?.action?.onClick).toBeDefined();

        toast?.action?.onClick?.call(
            toast?.action,
            {} as React.MouseEvent<HTMLElement>,
        );

        const action = await saga.take();
        expect(action).toEqual(fileStorageDeleteFile('test.file'));

        await saga.end();
    });

    it('should close automatically if the file is deleted without user action', async () => {
        const { toaster, saga } = createTestToasterSaga();

        saga.put(explorerDeleteFile('test.file'));

        expect(
            toaster
                .getToasts()
                .find((t) => t.key === MessageId.ExplorerDeleteFileMessage),
        ).toBeDefined();

        saga.put(fileStorageDidRemoveItem('test.file'));

        expect(
            toaster
                .getToasts()
                .find((t) => t.key === MessageId.ExplorerDeleteFileMessage),
        ).toBeUndefined();

        await saga.end();
    });
});
