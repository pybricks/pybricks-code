// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
//
// Actions for Bluetooth Low Energy Nordic UART service

import { Action } from 'redux';

/**
 * BLE nRF UART service actions types.
 */
export enum BleUartActionType {
    /**
     * Write data.
     */
    Write = 'bleUart.action.write',
    /**
     * Writing completed successfully.
     */
    DidWrite = 'bleUart.didWrite',
    /**
     * Writing failed.
     */
    DidFailToWrite = 'bleUart.action.didFailToWrite',
    /**
     * Notify that data was received.
     */
    DidNotify = 'bleUart.action.didNotify',
}

export type BleUartWriteAction = Action<BleUartActionType.Write> & {
    id: number;
    value: Uint8Array;
};

export function write(id: number, value: Uint8Array): BleUartWriteAction {
    return { type: BleUartActionType.Write, id, value };
}

export type BleUartDidWriteAction = Action<BleUartActionType.DidWrite> & {
    id: number;
};

export function didWrite(id: number): BleUartDidWriteAction {
    return { type: BleUartActionType.DidWrite, id };
}

export type BleUartDidFailToWriteAction = Action<BleUartActionType.DidFailToWrite> & {
    id: number;
    err: Error;
};

export function didFailToWrite(id: number, err: Error): BleUartDidFailToWriteAction {
    return { type: BleUartActionType.DidFailToWrite, id, err };
}

export type BleUartDidNotifyAction = Action<BleUartActionType.DidNotify> & {
    value: DataView;
};

export function didNotify(value: DataView): BleUartDidNotifyAction {
    return { type: BleUartActionType.DidNotify, value };
}

/** Common type for low-level BLE data actions. */
export type BleUartAction =
    | BleUartWriteAction
    | BleUartDidWriteAction
    | BleUartDidFailToWriteAction
    | BleUartDidNotifyAction;
