// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

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
    /** Firmware flash progress. */
    DidProgress = 'flashFirmware.action.didProgress',
    /** Flashing finished successfully. */
    DidFinish = 'flashFirmware.action.didFinish',
    /** Flashing firmware failed. */
    DidFailToFinish = 'flashFirmware.action.didFailToFinish',
}

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
export type FlashFirmwareDidFailToFinishAction = Action<FlashFirmwareActionType.DidFailToFinish>;

/** Action that indicates that flashing failed. */
export function didFailToFinish(): FlashFirmwareDidFailToFinishAction {
    return { type: FlashFirmwareActionType.DidFailToFinish };
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
