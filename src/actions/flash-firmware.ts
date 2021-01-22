// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { FirmwareMetadata, FirmwareReaderError } from '@pybricks/firmware';
import { Action } from 'redux';
import { assert } from '../utils';

/**
 * High-level bootloader actions.
 */
export enum FlashFirmwareActionType {
    /** Request to flash new firmware to the device. */
    FlashFirmware = 'flashFirmware.action.flashFirmware',
    /** Actual modification of the flash memory on the device started. */
    DidStart = 'flashFirmware.action.didStart',
    /** Firmware flash progress. */
    DidProgress = 'flashFirmware.action.didProgress',
    /** Flashing finished successfully. */
    DidFinish = 'flashFirmware.action.didFinish',
    /** Flashing firmware failed. */
    DidFailToFinish = 'flashFirmware.action.didFailToFinish',
}

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

export type FailToFinishReasonFailedToConnect = Reason<FailToFinishReasonType.FailedToConnect>;

export type FailToFinishReasonTimedOut = Reason<FailToFinishReasonType.TimedOut>;

export type FailToFinishReasonBleError = Reason<FailToFinishReasonType.BleError> & {
    err: Error;
};

export type FailToFinishReasonDisconnected = Reason<FailToFinishReasonType.Disconnected>;

export type FailToFinishReasonHubError = Reason<FailToFinishReasonType.HubError> & {
    hubError: HubError;
};

export type FailToFinishReasonNoFirmware = Reason<FailToFinishReasonType.NoFirmware>;

export type FailToFinishReasonDeviceMismatch = Reason<FailToFinishReasonType.DeviceMismatch>;

export type FailToFinishReasonFailedToFetch = Reason<FailToFinishReasonType.FailedToFetch> & {
    response: Response;
};

export type FailToFinishReasonZipError = Reason<FailToFinishReasonType.ZipError> & {
    err: FirmwareReaderError;
};

export type FailToFinishReasonBadMetadata = Reason<FailToFinishReasonType.BadMetadata> & {
    property: keyof FirmwareMetadata;
    problem: MetadataProblem;
};

export type FailToFinishReasonFirmwareSize = Reason<FailToFinishReasonType.FirmwareSize>;

export type FailToFinishReasonFailedToCompile = Reason<FailToFinishReasonType.FailedToCompile>;

export type FailToFinishReasonUnknown = Reason<FailToFinishReasonType.Unknown> & {
    err: Error;
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

/**
 * Action that flashes firmware to a hub.
 */
export type FlashFirmwareFlashAction = Action<FlashFirmwareActionType.FlashFirmware> & {
    /** The firmware zip file data or undefined to get firmware later. */
    data?: ArrayBuffer;
};

/**
 * Creates a new action to flash firmware to a hub.
 * @param data The firmware zip file data or undefined to get firmware later.
 */
export function flashFirmware(data?: ArrayBuffer): FlashFirmwareFlashAction {
    return { type: FlashFirmwareActionType.FlashFirmware, data };
}

/** Action that indicates flashing firmware started. */
export type FlashFirmwareDidStartAction = Action<FlashFirmwareActionType.DidStart>;

/**
 * Action that indicates flashing firmware started.
 * @param total The total number of bytes to be flashed.
 */
export function didStart(): FlashFirmwareDidStartAction {
    return { type: FlashFirmwareActionType.DidStart };
}

/** Action that indicates current firmware flashing progress. */
export type FlashFirmwareDidProgressAction = Action<FlashFirmwareActionType.DidProgress> & {
    /** The current progress (0 to 1). */
    value: number;
};

/**
 * Action that indicates current firmware flashing progress.
 * @param value The current progress (0 to 1).
 */
export function didProgress(value: number): FlashFirmwareDidProgressAction {
    assert(value >= 0 && value <= 1, 'value out of range');
    return { type: FlashFirmwareActionType.DidProgress, value };
}

/** Action that indicates that flashing firmware completed successfully. */
export type FlashFirmwareDidFinishAction = Action<FlashFirmwareActionType.DidFinish>;

/** Action that indicates that flashing firmware completed successfully. */
export function didFinish(): FlashFirmwareDidFinishAction {
    return { type: FlashFirmwareActionType.DidFinish };
}

/** Action that indicates that flashing failed. */
export type FlashFirmwareDidFailToFinishAction = Action<FlashFirmwareActionType.DidFailToFinish> & {
    reason: FailToFinishReason;
};

export function didFailToFinish(
    reason: FailToFinishReasonType.BleError,
    err: Error,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.HubError,
    hubError: HubError,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.FailedToFetch,
    response: Response,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.ZipError,
    err: FirmwareReaderError,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.BadMetadata,
    property: keyof FirmwareMetadata,
    problem: MetadataProblem,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.Unknown,
    err: Error,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: Exclude<
        FailToFinishReasonType,
        | FailToFinishReasonType.BleError
        | FailToFinishReasonType.HubError
        | FailToFinishReasonType.FailedToFetch
        | FailToFinishReasonType.ZipError
        | FailToFinishReasonType.BadMetadata
        | FailToFinishReasonType.Unknown
    >,
): FlashFirmwareDidFailToFinishAction;

/**
 * Action that indicates flashing did not start because of an error.
 * @param total The total number of bytes to be flashed.
 */
export function didFailToFinish(
    reason: FailToFinishReasonType,
    arg1?: string | HubError | Error | Response,
    arg2?: MetadataProblem,
): FlashFirmwareDidFailToFinishAction {
    if (reason === FailToFinishReasonType.BleError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof Error)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, err: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.HubError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!isHubError(arg1)) {
            throw new Error('missing or invalid hubError');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, hubError: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.FailedToFetch) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof Response)) {
            throw new Error('missing or invalid response');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, response: arg1 },
        };
    }

    if (reason === FailToFinishReasonType.ZipError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof FirmwareReaderError)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
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
            arg1 !== 'max-firmware-size'
        ) {
            throw new Error('missing or invalid property');
        }
        // istanbul ignore if: programmer error give wrong arg
        if (arg2 === undefined) {
            throw new Error('missing or invalid problem');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, property: arg1, problem: arg2 },
        };
    }

    if (reason === FailToFinishReasonType.Unknown) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof Error)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, err: arg1 },
        };
    }

    return { type: FlashFirmwareActionType.DidFailToFinish, reason: { reason } };
}

/**
 * Common type for all high-level bootloader actions.
 */
export type FlashFirmwareAction =
    | FlashFirmwareFlashAction
    | FlashFirmwareDidStartAction
    | FlashFirmwareDidProgressAction
    | FlashFirmwareDidFinishAction
    | FlashFirmwareDidFailToFinishAction;
