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
    /** Flashing started. */
    DidStart = 'flashFirmware.action.didStart',
    /** Flashing was not able to start. */
    DidFailToStart = 'flashFirmware.action.didFailStart',
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
    if (typeof arg !== 'string') {
        return false;
    }
    return Object.keys(HubError).includes(arg);
}

type Reason<T> = {
    reason: T;
};

export enum FailToStartReasonType {
    /** Connecting to the hub failed. */
    FailedToConnect = 'flashFirmware.failToStart.reason.failedToConnect',
    /** The hub was disconnected. */
    Disconnected = 'flashFirmware.failToStart.reason.disconnected',
    /** The is no firmware available that matches the connected hub. */
    NoFirmware = 'flashFirmware.failToStart.reason.noFirmware',
    /** The provided firmware.zip does not match the connected hub. */
    DeviceMismatch = 'flashFirmware.failToStart.reason.deviceMismatch',
    /** There was a problem with the zip file. */
    ZipError = 'flashFirmware.failToStart.reason.zipError',
    /** Metadata property is missing or invalid. */
    BadMetadata = 'flashFirmware.failToStart.reason.badMetadata',
    /** The main.py file failed to compile. */
    FailedToCompile = 'flashFirmware.failToStart.reason.failedToCompile',
    /** The combined firmware-base.bin and main.mpy are too big. */
    FirmwareSize = 'flashFirmware.failToStart.reason.firmwareSize',
    /** An unexpected error occurred. */
    Unknown = 'flashFirmware.failToStart.reason.unknown',
}

export type FailToStartReasonFailedToConnect = Reason<FailToStartReasonType.FailedToConnect>;

export type FailToStartReasonDisconnected = Reason<FailToStartReasonType.Disconnected>;

export type FailToStartReasonNoFirmware = Reason<FailToStartReasonType.NoFirmware>;

export type FailToStartReasonDeviceMismatch = Reason<FailToStartReasonType.DeviceMismatch>;

export type FailToStartReasonZipError = Reason<FailToStartReasonType.ZipError> & {
    err: FirmwareReaderError;
};

export type FailToStartReasonBadMetadata = Reason<FailToStartReasonType.BadMetadata> & {
    property: keyof FirmwareMetadata;
    problem: MetadataProblem;
};

export type FailToStartReasonFirmwareSize = Reason<FailToStartReasonType.FirmwareSize>;

export type FailToStartReasonFailedToCompile = Reason<FailToStartReasonType.FailedToCompile>;

export type FailToStartReasonUnknown = Reason<FailToStartReasonType.Unknown> & {
    err: Error;
};

export type FailToStartReason =
    | FailToStartReasonFailedToConnect
    | FailToStartReasonDisconnected
    | FailToStartReasonNoFirmware
    | FailToStartReasonDeviceMismatch
    | FailToStartReasonZipError
    | FailToStartReasonBadMetadata
    | FailToStartReasonFirmwareSize
    | FailToStartReasonFailedToCompile
    | FailToStartReasonUnknown;

export enum FailToFinishReasonType {
    /** Waiting for a response from the hub took too long. */
    TimedOut = 'flashFirmware.failToFinish.reason.timedOut',
    /** Something went wrong with the BLE connection. */
    BleError = 'flashFirmware.failToFinish.reason.bleError',
    /** The BLE connection was lost before flashing completed. */
    Disconnected = 'flashFirmware.failToFinish.reason.disconnected',
    /** The hub sent a response indicating a problem. */
    HubError = 'flashFirmware.failToFinish.reason.hubError',
    /** An unexpected error occurred. */
    Unknown = 'flashFirmware.failToFinish.reason.unknown',
}

export type FailToFinishReasonTimedOut = Reason<FailToFinishReasonType.TimedOut>;

export type FailToFinishReasonBleError = Reason<FailToFinishReasonType.BleError>;

export type FailToFinishReasonDisconnected = Reason<FailToFinishReasonType.Disconnected>;

export type FailToFinishReasonHubError = Reason<FailToFinishReasonType.HubError> & {
    hubError: HubError;
};

export type FailToFinishReasonUnknown = Reason<FailToFinishReasonType.Unknown> & {
    err: Error;
};

export type FailToFinishReason =
    | FailToFinishReasonTimedOut
    | FailToFinishReasonBleError
    | FailToFinishReasonDisconnected
    | FailToFinishReasonHubError
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

/** Action that indicates flashing did not start because of an error. */
export type FlashFirmwareDidFailToStartAction = Action<FlashFirmwareActionType.DidFailToStart> & {
    reason: FailToStartReason;
};

export function didFailToStart(
    reason: FailToStartReasonType.ZipError,
    err: FirmwareReaderError,
): FlashFirmwareDidFailToStartAction;

export function didFailToStart(
    reason: FailToStartReasonType.BadMetadata,
    property: keyof FirmwareMetadata,
    problem: MetadataProblem,
): FlashFirmwareDidFailToStartAction;

export function didFailToStart(
    reason: FailToStartReasonType.Unknown,
    err: Error,
): FlashFirmwareDidFailToStartAction;

export function didFailToStart(
    reason: Exclude<
        FailToStartReasonType,
        | FailToStartReasonType.ZipError
        | FailToStartReasonType.BadMetadata
        | FailToStartReasonType.Unknown
    >,
): FlashFirmwareDidFailToStartAction;

/**
 * Action that indicates flashing did not start because of an error.
 * @param total The total number of bytes to be flashed.
 */
export function didFailToStart(
    reason: FailToStartReasonType,
    arg1?: string | Error,
    arg2?: MetadataProblem,
): FlashFirmwareDidFailToStartAction {
    if (reason === FailToStartReasonType.ZipError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof FirmwareReaderError)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToStart,
            reason: { reason, err: arg1 },
        };
    }

    if (reason === FailToStartReasonType.BadMetadata) {
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
            type: FlashFirmwareActionType.DidFailToStart,
            reason: { reason, property: arg1, problem: arg2 },
        };
    }

    if (reason === FailToStartReasonType.Unknown) {
        // istanbul ignore if: programmer error give wrong arg
        if (!(arg1 instanceof Error)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToStart,
            reason: { reason, err: arg1 },
        };
    }

    return { type: FlashFirmwareActionType.DidFailToStart, reason: { reason } };
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
    reason: FailToFinishReasonType.HubError,
    hubError: HubError,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: FailToFinishReasonType.Unknown,
    err: Error,
): FlashFirmwareDidFailToFinishAction;

export function didFailToFinish(
    reason: Exclude<
        FailToFinishReasonType,
        FailToFinishReasonType.HubError | FailToFinishReasonType.Unknown
    >,
): FlashFirmwareDidFailToFinishAction;

/** Action that indicates that flashing failed. */
export function didFailToFinish(
    reason: FailToFinishReasonType,
    arg1?: HubError | Error,
): FlashFirmwareDidFailToFinishAction {
    if (reason === FailToFinishReasonType.HubError) {
        // istanbul ignore if: programmer error give wrong arg
        if (!isHubError(arg1)) {
            throw new Error('missing or invalid err');
        }
        return {
            type: FlashFirmwareActionType.DidFailToFinish,
            reason: { reason, hubError: arg1 },
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
    | FlashFirmwareDidFailToStartAction
    | FlashFirmwareDidProgressAction
    | FlashFirmwareDidFinishAction
    | FlashFirmwareDidFailToFinishAction;
