// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import type { IToastOptions, ToasterInstance } from '@blueprintjs/core';
import { FirmwareReaderError, FirmwareReaderErrorCode } from '@pybricks/firmware';
import { mock } from 'jest-mock-extended';
import { AnyAction } from 'redux';
import { AsyncSaga, uuid } from '../../test';
import { appDidCheckForUpdate } from '../app/actions';
import { editorDidFailToOpenFile } from '../editor/actions';
import { EditorError } from '../editor/error';
import {
    explorerDidFailToCreateNewFile,
    explorerDidFailToDeleteFile,
    explorerDidFailToDuplicateFile,
    explorerDidFailToExportFile,
    explorerDidFailToImportFiles,
} from '../explorer/actions';
import { fileStorageDidFailToInitialize } from '../fileStorage/actions';
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
import { add } from './actions';
import { I18nId } from './i18n';
import notification from './sagas';

function createTestToasterSaga(): { toaster: ToasterInstance; saga: AsyncSaga } {
    const toasts = new Map<string, IToastOptions>();

    const toaster = mock<ToasterInstance>({
        show: (props, key) => {
            return key ?? '';
        },
        dismiss: (key) => {
            toasts.delete(key);
        },
        clear: () => {
            toasts.clear();
        },
        getToasts: () => [...toasts.values()],
    });

    jest.spyOn(toaster, 'clear');
    jest.spyOn(toaster, 'dismiss');
    jest.spyOn(toaster, 'getToasts');
    jest.spyOn(toaster, 'show');

    const saga = new AsyncSaga(notification, { toasterRef: { current: toaster } });

    return { toaster, saga };
}

test.each([
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Unknown, <Error>{
        message: 'test',
    }),
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
    fileStorageDidFailToInitialize(new Error('test error')),
    explorerDidFailToImportFiles(new Error('test error')),
    explorerDidFailToCreateNewFile(new Error('test error')),
    explorerDidFailToDuplicateFile('test.file', new Error('test error')),
    explorerDidFailToExportFile('test.file', new Error('test error')),
    explorerDidFailToDeleteFile('test.file', new Error('test error')),
    editorDidFailToOpenFile(uuid(0), new Error('test error')),
])('actions that should show notification: %o', async (action: AnyAction) => {
    const { toaster, saga } = createTestToasterSaga();

    saga.put(action);

    expect(toaster.show).toBeCalled();
    expect(toaster.dismiss).not.toBeCalled();
    expect(toaster.clear).not.toBeCalled();

    await saga.end();
});

test.each([
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.NoWebBluetooth),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.NoBluetooth),
    bootloaderDidFailToConnect(BootloaderConnectionFailureReason.Canceled),
    didFailToFinish(FailToFinishReasonType.FailedToConnect),
    serviceWorkerDidSucceed(),
    appDidCheckForUpdate(true),
    explorerDidFailToImportFiles(new DOMException('test message', 'AbortError')),
    explorerDidFailToCreateNewFile(new DOMException('test message', 'AbortError')),
    explorerDidFailToDuplicateFile(
        'test.file',
        new DOMException('test message', 'AbortError'),
    ),
    explorerDidFailToExportFile(
        'test.file',
        new DOMException('test message', 'AbortError'),
    ),
    explorerDidFailToDeleteFile(
        'test.file',
        new DOMException('test message', 'AbortError'),
    ),
    editorDidFailToOpenFile(uuid(0), new EditorError('FileInUse', 'test error')),
])('actions that should not show a notification: %o', async (action: AnyAction) => {
    const { toaster, saga } = createTestToasterSaga();

    saga.put(action);

    expect(toaster.getToasts).not.toBeCalled();
    expect(toaster.show).not.toBeCalled();
    expect(toaster.dismiss).not.toBeCalled();
    expect(toaster.clear).not.toBeCalled();

    await saga.end();
});

test.each([[didCompile(new Uint8Array()), I18nId.MpyError]])(
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
