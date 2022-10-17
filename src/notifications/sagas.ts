// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

// Saga for managing notifications (toasts)

import {
    ActionProps,
    IconName,
    Intent,
    LinkProps,
    ToasterInstance,
} from '@blueprintjs/core';
import { Replacements } from '@shopify/react-i18n';
import React from 'react';
import { channel } from 'redux-saga';
import { delay, getContext, put, take, takeEvery } from 'typed-redux-saga/macro';
import { getAlertProps } from '../alerts';
import { appDidCheckForUpdate, appReload } from '../app/actions';
import { appName } from '../app/constants';
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
import { FailToFinishReasonType, didFailToFinish } from '../firmware/actions';
import {
    BootloaderConnectionFailureReason,
    didFailToConnect as bootloaderDidFailToConnect,
} from '../lwp3-bootloader/actions';
import { didCompile, didFailToCompile } from '../mpy/actions';
import { serviceWorkerDidUpdate } from '../service-worker/actions';
import NotificationAction from './NotificationAction';
import NotificationMessage from './NotificationMessage';
import { add as addNotification } from './actions';
import { I18nId } from './i18n';

type NotificationContext = {
    toaster: ToasterInstance;
};

/**
 * Partial saga context type for context used in the notification sagas.
 */
export type NotificationSagaContext = {
    notification: NotificationContext;
};

/** Severity level of notification. */
enum Level {
    /** This is an error (requires user action to resolve). */
    Error = 'error',
    /** This is a warning (user could take action or ignore). */
    Warning = 'warning',
    /** This is just FYI (no user action required). */
    Info = 'info',
}

function mapIntent(level: Level): Intent {
    switch (level) {
        case Level.Error:
            return Intent.DANGER;
        case Level.Warning:
            return Intent.WARNING;
        case Level.Info:
            return Intent.PRIMARY;
        default:
            return Intent.NONE;
    }
}

function mapIcon(level: Level): IconName | undefined {
    switch (level) {
        case Level.Error:
            return 'error';
        case Level.Warning:
            return 'warning-sign';
        case Level.Info:
            return 'info-sign';
        default:
            return undefined;
    }
}

/**
 * Converts a URL to an action that can be passed to `ToasterInstance.show()`.
 * @param helpUrl A URL.
 */
function helpAction(helpUrl: string): ActionProps & LinkProps {
    return {
        icon: 'help',
        href: helpUrl,
        target: '_blank',
    };
}

function dispatchAction(
    messageId: I18nId,
    onClick: (event: React.MouseEvent<HTMLElement>) => void,
    icon?: IconName,
): ActionProps {
    return {
        icon: icon,
        text: React.createElement(NotificationAction, { messageId }),
        onClick,
    };
}

/**
 * Shows a message. If a message with the same `messageId` is already
 * showing, it will be closed before showing the new message.
 * @param level The severity level.
 * @param messageId The translation lookup ID.
 * @param replacements Replacements for the translation string.
 * @param action Optional action to add to the notification.
 * @param onDismiss Optional hook for when notification is dismissed.
 */
function* showSingleton(
    level: Level,
    messageId: I18nId,
    replacements?: Replacements,
    action?: ActionProps & LinkProps,
    onDismiss?: (didTimeoutExpire: boolean) => void,
): Generator {
    const { toaster } = yield* getContext<NotificationContext>('notification');

    // if the message is already showing, close it and wait some time so that
    // users can see that something triggered the message again
    if (
        toaster
            .getToasts()
            .map((x) => x.key)
            .includes(messageId)
    ) {
        toaster.dismiss(messageId);
        yield* delay(500);
    }

    toaster.show(
        {
            intent: mapIntent(level),
            icon: mapIcon(level),
            message: React.createElement(NotificationMessage, {
                messageId,
                replacements,
            }),
            timeout: 0,
            action,
            onDismiss,
        },
        messageId,
    );
}

/** Shows a special notification for unexpected errors. */
function* showUnexpectedError(messageId: I18nId, error: Error): Generator {
    const { toaster } = yield* getContext<NotificationContext>('notification');
    const key = `alerts.unexpectedError.${messageId}`;

    toaster.show(
        getAlertProps('alerts', 'unexpectedError', () => toaster.dismiss(key), {
            error,
        }),
    );
}

function* showBootloaderDidFailToConnectError(
    action: ReturnType<typeof bootloaderDidFailToConnect>,
): Generator {
    switch (action.reason) {
        case BootloaderConnectionFailureReason.GattServiceNotFound:
            yield* showSingleton(Level.Error, I18nId.BleGattServiceNotFound, {
                serviceName: 'LEGO Bootloader',
                hubName: 'LEGO Bootloader',
            });
            break;
        case BootloaderConnectionFailureReason.Unknown:
            yield* showUnexpectedError(I18nId.BleUnexpectedError, action.err);
            break;
    }
}

function* showFlashFirmwareError(
    action: ReturnType<typeof didFailToFinish>,
): Generator {
    switch (action.reason.reason) {
        case FailToFinishReasonType.TimedOut:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareTimedOut);
            break;
        case FailToFinishReasonType.BleError:
            yield* showUnexpectedError(
                I18nId.FlashFirmwareBleError,
                action.reason.error,
            );
            break;
        case FailToFinishReasonType.Disconnected:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareDisconnected);
            break;
        case FailToFinishReasonType.HubError:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareHubError);
            // istanbul ignore next
            if (process.env.NODE_ENV !== 'test') {
                console.error(action.reason.hubError);
            }
            break;
        case FailToFinishReasonType.NoFirmware:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareUnsupportedDevice);
            break;
        case FailToFinishReasonType.DeviceMismatch:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareDeviceMismatch);
            break;
        case FailToFinishReasonType.FailedToFetch:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareFailToFetch, {
                status: action.reason.response.statusText,
            });
            break;
        case FailToFinishReasonType.ZipError:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareBadZipFile);
            // istanbul ignore next
            if (process.env.NODE_ENV !== 'test') {
                console.error(action.reason.err);
            }
            break;
        case FailToFinishReasonType.BadMetadata:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareBadMetadata);
            // istanbul ignore next
            if (process.env.NODE_ENV !== 'test') {
                console.error(action.reason.property, action.reason.problem);
            }
            break;
        case FailToFinishReasonType.FailedToCompile:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareCompileError);
            break;
        case FailToFinishReasonType.FirmwareSize:
            yield* showSingleton(Level.Error, I18nId.FlashFirmwareSizeTooBig);
            break;
        case FailToFinishReasonType.Unknown:
            yield* showUnexpectedError(
                I18nId.FlashFirmwareUnexpectedError,
                action.reason.error,
            );
            break;
    }
}

function* dismissCompilerError(): Generator {
    const { toaster } = yield* getContext<NotificationContext>('notification');
    toaster.dismiss(I18nId.MpyError);
}

function* showCompilerError(action: ReturnType<typeof didFailToCompile>): Generator {
    yield* showSingleton(Level.Error, I18nId.MpyError, {
        errorMessage: React.createElement(
            'pre',
            { style: { whiteSpace: 'pre-wrap', wordBreak: 'keep-all' } },
            action.err.join('\n'),
        ),
    });
}

function* handleAddNotification(action: ReturnType<typeof addNotification>): Generator {
    const { toaster } = yield* getContext<NotificationContext>('notification');

    toaster.show({
        intent: mapIntent(action.level as Level),
        icon: mapIcon(action.level as Level),
        message: action.message,
        timeout: 0,
        action: action.helpUrl ? helpAction(action.helpUrl) : undefined,
    });
}

function* showServiceWorkerUpdate(): Generator {
    const ch = channel<React.MouseEvent<HTMLElement>>();
    const userAction = dispatchAction(
        I18nId.ServiceWorkerUpdateAction,
        ch.put,
        'refresh',
    );
    yield* showSingleton(
        Level.Info,
        I18nId.ServiceWorkerUpdateMessage,
        {
            appName,
            action: React.createElement('strong', undefined, userAction.text),
        },
        userAction,
        ch.close,
    );

    yield* take(ch);

    yield* put(appReload());
}

function* showNoUpdateInfo(action: ReturnType<typeof appDidCheckForUpdate>): Generator {
    if (action.updateFound) {
        // this will be handled by serviceWorkerDidUpdate action
        return;
    }

    const { toaster } = yield* getContext<NotificationContext>('notification');
    toaster.show({
        intent: mapIntent(Level.Info),
        icon: mapIcon(Level.Info),
        message: React.createElement(NotificationMessage, {
            messageId: I18nId.AppNoUpdateFound,
            replacements: { appName },
        }),
    });
}

function* showFileStorageFailToInitialize(
    action: ReturnType<typeof fileStorageDidFailToInitialize>,
): Generator {
    yield* showUnexpectedError(I18nId.FileStorageFailedToInitialize, action.error);
}

function* showExplorerFailToImportFiles(
    action: ReturnType<typeof explorerDidFailToImportFiles>,
): Generator {
    if (action.error.name === 'AbortError') {
        // user clicked cancel button - not an error
        return;
    }

    yield* showUnexpectedError(I18nId.ExplorerFailedToImportFiles, action.error);
}

function* showExplorerFailToCreateFile(
    action: ReturnType<typeof explorerDidFailToCreateNewFile>,
): Generator {
    if (action.error.name === 'AbortError') {
        // user clicked cancel button - not an error
        return;
    }

    yield* showUnexpectedError(I18nId.ExplorerFailedToCreate, action.error);
}

function* showExplorerFailToDuplicate(
    action: ReturnType<typeof explorerDidFailToDuplicateFile>,
): Generator {
    if (action.error.name === 'AbortError') {
        // user clicked cancel button - not an error
        return;
    }

    yield* showUnexpectedError(I18nId.ExplorerFailedToDuplicate, action.error);
}

function* showExplorerFailToExport(
    action: ReturnType<typeof explorerDidFailToExportFile>,
): Generator {
    if (action.error.name === 'AbortError') {
        // user clicked cancel button - not an error
        return;
    }

    yield* showUnexpectedError(I18nId.ExplorerFailedToExport, action.error);
}

function* showEditorDidFailToOpenFile(
    action: ReturnType<typeof editorDidFailToOpenFile>,
): Generator {
    if (action.error instanceof EditorError && action.error.name === 'FileInUse') {
        return;
    }

    yield* showUnexpectedError(I18nId.EditorFailedToOpenFile, action.error);
}

function* showExplorerFailToDelete(
    action: ReturnType<typeof explorerDidFailToDeleteFile>,
): Generator {
    if (action.error.name === 'AbortError') {
        // user clicked cancel button - not an error
        return;
    }

    // TODO: add a specific error message for when file in use (e.g. open in another window)

    yield* showUnexpectedError(I18nId.ExplorerFailedToDelete, action.error);
}

export default function* (): Generator {
    yield* takeEvery(bootloaderDidFailToConnect, showBootloaderDidFailToConnectError);
    yield* takeEvery(didFailToFinish, showFlashFirmwareError);
    yield* takeEvery(didCompile, dismissCompilerError);
    yield* takeEvery(didFailToCompile, showCompilerError);
    yield* takeEvery(addNotification, handleAddNotification);
    yield* takeEvery(serviceWorkerDidUpdate, showServiceWorkerUpdate);
    yield* takeEvery(appDidCheckForUpdate, showNoUpdateInfo);
    yield* takeEvery(fileStorageDidFailToInitialize, showFileStorageFailToInitialize);
    yield* takeEvery(explorerDidFailToImportFiles, showExplorerFailToImportFiles);
    yield* takeEvery(explorerDidFailToCreateNewFile, showExplorerFailToCreateFile);
    yield* takeEvery(explorerDidFailToDuplicateFile, showExplorerFailToDuplicate);
    yield* takeEvery(explorerDidFailToExportFile, showExplorerFailToExport);
    yield* takeEvery(explorerDidFailToDeleteFile, showExplorerFailToDelete);
    yield* takeEvery(editorDidFailToOpenFile, showEditorDidFailToOpenFile);
}
