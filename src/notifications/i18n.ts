// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Notification translation keys.

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    AppNoUpdateFound = 'app.noUpdateFound',
    BleUnexpectedError = 'ble.unexpectedError',
    BleGattPermission = 'ble.gattPermission',
    BleGattServiceNotFound = 'ble.gattServiceNotFound',
    BleNoBluetooth = 'ble.noBluetooth',
    EditorFailedToOpenFile = 'editor.failedToOpenFile',
    EditorFailedToSaveFile = 'editor.failedToSaveFile',
    ExplorerFailedToImportFiles = 'explorer.failedToImportFiles',
    ExplorerFailedToCreate = 'explorer.failedToCreate',
    ExplorerFailedToDelete = 'explorer.failedToDelete',
    ExplorerFailedToDuplicate = 'explorer.failedToDuplicate',
    ExplorerFailedToExport = 'explorer.failedToExport',
    ExplorerFailedToArchive = 'explorer.failedToArchive',
    FileStorageFailedToInitialize = 'fileStorage.failedToInitialize',
    FlashFirmwareTimedOut = 'flashFirmware.timedOut',
    FlashFirmwareBleError = 'flashFirmware.bleError',
    FlashFirmwareDisconnected = 'flashFirmware.disconnected',
    FlashFirmwareHubError = 'flashFirmware.hubError',
    FlashFirmwareUnsupportedDevice = 'flashFirmware.unsupportedDevice',
    FlashFirmwareDeviceMismatch = 'flashFirmware.deviceMismatch',
    FlashFirmwareFailToFetch = 'flashFirmware.failToFetch',
    FlashFirmwareBadZipFile = 'flashFirmware.badZipFile',
    FlashFirmwareBadMetadata = 'flashFirmware.badMetadata',
    FlashFirmwareCompileError = 'flashFirmware.compileError',
    FlashFirmwareSizeTooBig = 'flashFirmware.sizeTooBig',
    FlashFirmwareUnexpectedError = 'flashFirmware.unexpectedError',
    ServiceWorkerUpdateMessage = 'serviceWorker.update.message',
    ServiceWorkerUpdateAction = 'serviceWorker.update.action',
    MpyError = 'mpy.error',
    CheckFirmwareTooOld = 'check.firmwareTooOld',
}
