// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { FirmwareReaderError } from '@pybricks/firmware';
import { createAction } from '../actions';

export enum MetadataProblem {
    Missing = 'metadata.missing',
    NotSupported = 'metadata.notSupported',
}

export enum HubError {
    UnknownCommand = 'hubError.unknownCommand',
    EraseFailed = 'hubError.eraseFailed',
    InitFailed = 'hubError.initFailed',
    CountMismatch = 'hubError.countMismatch',
    ChecksumMismatch = 'hubError.checksumMismatch',
}

function isHubError(arg: unknown): arg is HubError {
    return Object.values(HubError).includes(arg as HubError);
}

export enum FailToFinishReasonType {
    /** Connecting to the hub failed. */
    FailedToConnect = 'flashFirmware.failToFinish.reason.failedToConnect',
    /** The hub connection timed out. */
    TimedOut = 'flashFirmware.failToFinish.reason.timedOut',
    /** Something went wrong with the BLE connection. */
    BleError = 'flashFirmware.failToFinish.reason.bleError',
    /** The hub was disconnected. */
    Disconnected = 'flashFirmware.failToFinish.reason.disconnected',
    /** The hub sent a response indicating a problem. */
    HubError = 'flashFirmware.failToFinish.reason.hubError',
    /** The is no firmware available that matches the connected hub. */
    NoFirmware = 'flashFirmware.failToFinish.reason.noFirmware',
    /** The provided firmware.zip does not match the connected hub. */
    DeviceMismatch = 'flashFirmware.failToFinish.reason.deviceMismatch',
    /** Failed to fetch firmware from the server. */
    FailedToFetch = 'flashFirmware.failToFinish.reason.failedToFetch',
    /** There was a problem with the zip file. */
    ZipError = 'flashFirmware.failToFinish.reason.zipError',
    /** Metadata property is missing or invalid. */
    BadMetadata = 'flashFirmware.failToFinish.reason.badMetadata',
    /** The main.py file failed to compile. */
    FailedToCompile = 'flashFirmware.failToFinish.reason.failedToCompile',
    /** The combined firmware-base.bin and main.mpy are too big. */
    FirmwareSize = 'flashFirmware.failToFinish.reason.firmwareSize',
    /** An unexpected error occurred. */
    Unknown = 'flashFirmware.failToFinish.reason.unknown',
}

type Reason<T extends FailToFinishReasonType> = {
    reason: T;
};

export type FailToFinishReasonFailedToConnect =
    Reason<FailToFinishReasonType.FailedToConnect>;

export type FailToFinishReasonTimedOut = Reason<FailToFinishReasonType.TimedOut>;

export type FailToFinishReasonBleError = Reason<FailToFinishReasonType.BleError> & {
    error: Error;
};

export type FailToFinishReasonDisconnected =
    Reason<FailToFinishReasonType.Disconnected>;

export type FailToFinishReasonHubError = Reason<FailToFinishReasonType.HubError> & {
    hubError: HubError;
};

export type FailToFinishReasonNoFirmware = Reason<FailToFinishReasonType.NoFirmware>;

export type FailToFinishReasonDeviceMismatch =
    Reason<FailToFinishReasonType.DeviceMismatch>;

export type FailToFinishReasonFailedToFetch =
    Reason<FailToFinishReasonType.FailedToFetch> & {
        response: Response;
    };

export type FailToFinishReasonZipError = Reason<FailToFinishReasonType.ZipError> & {
    err: FirmwareReaderError;
};

export type FailToFinishReasonBadMetadata =
    Reason<FailToFinishReasonType.BadMetadata> & {
        property: string;
        problem: MetadataProblem;
    };

export type FailToFinishReasonFirmwareSize =
    Reason<FailToFinishReasonType.FirmwareSize>;

export type FailToFinishReasonFailedToCompile =
    Reason<FailToFinishReasonType.FailedToCompile>;

export type FailToFinishReasonUnknown = Reason<FailToFinishReasonType.Unknown> & {
    error: Error;
};

export type FailToFinishReason =
    | FailToFinishReasonFailedToConnect
    | FailToFinishReasonTimedOut
    | FailToFinishReasonBleError
    | FailToFinishReasonDisconnected
    | FailToFinishReasonHubError
    | FailToFinishReasonNoFirmware
    | FailToFinishReasonDeviceMismatch
    | FailToFinishReasonFailedToFetch
    | FailToFinishReasonZipError
    | FailToFinishReasonBadMetadata
    | FailToFinishReasonFirmwareSize
    | FailToFinishReasonFailedToCompile
    | FailToFinishReasonUnknown;

// High-level bootloader actions.

/**
 * Creates a new action to flash firmware to a hub.
 * @param data The firmware zip file data or `null` to get firmware later.
 * @param hubName A custom hub name or an empty string to use the default name.
 */
export const flashFirmware = createAction(
    (data: ArrayBuffer | null, hubName: string) => ({
        type: 'flashFirmware.action.flashFirmware',
        data,
        hubName,
    }),
);

/**
 * Action that indicates flashing firmware started.
 * @param total The total number of bytes to be flashed.
 */
export const didStart = createAction(() => ({
    type: 'flashFirmware.action.didStart',
}));

/**
 * Action that indicates current firmware flashing progress.
 * @param value The current progress (0 to 1).
 */
export const didProgress = createAction((value: number) => {
    // assert(value >= 0 && value <= 1, 'value out of range');
    return { type: 'flashFirmware.action.didProgress', value };
});

/** Action that indicates that flashing firmware completed successfully. */
export const didFinish = createAction(() => ({
    type: 'flashFirmware.action.didFinish',
}));

function isError(err: unknown): err is Error {
    const maybeError = err as Error;

    return (
        maybeError !== undefined &&
        typeof maybeError.name === 'string' &&
        typeof maybeError.message === 'string'
    );
}

// FIXME: get rid of this monstrosity

const didFailToFinishType = 'flashFirmware.action.didFailToFinish';

function didFailToFinishCreator(reason: FailToFinishReasonType.FailedToConnect): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonFailedToConnect;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.TimedOut): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonTimedOut;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.BleError,
    error: Error,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonBleError;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.Disconnected): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonDisconnected;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.HubError,
    hubError: HubError,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonHubError;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.NoFirmware): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonNoFirmware;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.DeviceMismatch): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonDeviceMismatch;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.FailedToFetch,
    response: Response,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonFailedToFetch;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.ZipError,
    err: FirmwareReaderError,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonZipError;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.BadMetadata,
    property: string,
    problem: MetadataProblem,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonBadMetadata;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.FirmwareSize): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonFirmwareSize;
};

function didFailToFinishCreator(reason: FailToFinishReasonType.FailedToCompile): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonFailedToCompile;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType.Unknown,
    error: Error,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReasonUnknown;
};

function didFailToFinishCreator<T extends FailToFinishReasonType>(
    reason: T,
    arg1?: string | HubError | Error | Response,
    arg2?: MetadataProblem,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReason;
};

function didFailToFinishCreator(
    reason: FailToFinishReasonType,
    arg1?: string | HubError | Error | Response,
    arg2?: MetadataProblem,
): {
    type: typeof didFailToFinishType;
    reason: FailToFinishReason;
} {
    if (reason === FailToFinishReasonType.BleError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!isError(arg1)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, error: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.HubError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!isHubError(arg1)) {
            throw new Error('missing or invalid hubError');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, hubError: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.FailedToFetch) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof Response)) {
            throw new Error('missing or invalid response');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, response: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.ZipError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof FirmwareReaderError)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, err: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.BadMetadata) {
        // istanbul ignore if: programmer error give wrong arg
        if (
            arg1 !== 'metadata-version' &&
            arg1 !== 'firmware-version' &&
            arg1 !== 'device-id' &&
            arg1 !== 'checksum-type' &&
            arg1 !== 'mpy-abi-version' &&
            arg1 !== 'mpy-cross-options' &&
            arg1 !== 'user-mpy-offset' &&
            arg1 !== 'max-firmware-size' &&
            arg1 !== 'checksum-size' &&
            arg1 !== 'hub-name-size'
        ) {
            throw new Error('missing or invalid property');
        }
        // istanbul ignore if: programmer error give wrong arg
        if (arg2 === undefined) {
            throw new Error('missing or invalid problem');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, property: arg1, problem: arg2 },
        };
    }

    if (reason === FailToFinishReasonType.Unknown) {
        // istanbul ignore if: programmer error give wrong arg
        if (!isError(arg1)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: didFailToFinishType,
            reason: { reason, error: arg1 },
        };
    }

    return { type: didFailToFinishType, reason: { reason } };
}

/**
 * Action that indicates flashing did not start because of an error.
 * @param total The total number of bytes to be flashed.
 */
export const didFailToFinish = createAction(didFailToFinishCreator);

/**
 * Low-level action to flash firmware using LEGO's DFU over USB.
 * @param data The firmware zip file data.
 * @param hubName A custom hub name or an empty string to use the default name.
 */
export const firmwareFlashUsbDfu = createAction(
    (data: ArrayBuffer, hubName: string) => ({
        type: 'firmware.action.flashUsbDfu',
        data,
        hubName,
    }),
);

/**
 * Low-level action that indicates {@link firmwareFlashUsbDfu} succeeded.
 */
export const firmwareDidFlashUsbDfu = createAction(() => ({
    type: 'firmware.action.didFlashUsbDfu',
}));

/**
 * Low-level action that indicates {@link firmwareFlashUsbDfu} failed.
 */
export const firmwareDidFailToFlashUsbDfu = createAction(() => ({
    type: 'firmware.action.didFailToFlashUsbDfu',
}));

// High-level actions

/**
 * Action that triggers the install Pybricks firmware saga.
 */
export const firmwareInstallPybricks = createAction(() => ({
    type: 'firmware.action.installPybricks',
}));

/**
 * Action that indicates {@link firmwareInstallPybricks} succeeded.
 */
export const firmwareDidInstallPybricks = createAction(() => ({
    type: 'firmware.action.didInstallPybricks',
}));

/**
 * Action that indicates {@link firmwareInstallPybricks} failed.
 */
export const firmwareDidFailToInstallPybricks = createAction(() => ({
    type: 'firmware.action.didFailToInstallPybricks',
}));
