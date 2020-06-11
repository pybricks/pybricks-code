// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

/**
 * High-level bootloader actions.
 */
export enum FlashFirmwareActionType {
    /**
     * Flash new firmware to the device.
     */
    FlashFirmware = 'flashFirmware.action.flashFirmware',
    /**
     * Firmware flash progress.
     */
    Progress = 'flashFirmware.action.progress',
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

export type FlashFirmwareProgressAction = Action<FlashFirmwareActionType.Progress> & {
    /**
     * The number of bytes that have been flashed so far.
     */
    complete: number;
    /**
     * The total number of bytes to be flashed.
     */
    total: number;
};

export function progress(complete: number, total: number): FlashFirmwareProgressAction {
    return { type: FlashFirmwareActionType.Progress, complete, total };
}

/**
 * Common type for all high-level bootloader actions.
 */
export type FlashFirmwareAction =
    | FlashFirmwareFlashAction
    | FlashFirmwareProgressAction;
