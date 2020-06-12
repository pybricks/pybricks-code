// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// actions/ble-uart.ts: Actions for Bluetooth Low Energy nRF UART service

import { Action } from 'redux';
import { createCountFunc } from '../utils/iter';

/**
 * BLE nRF UART service actions types.
 */
export enum BleUartActionType {
    /**
     * Write data.
     */
    Write = 'ble.data.action.write',
    /**
     * Writing completed successfully.
     */
    DidWrite = 'ble.data.didWrite',
    /**
     * Writing failed.
     */
    DidFailToWrite = 'ble.data.action.didFailToWrite',
    /**
     * Notify that data was received.
     */
    Notify = 'ble.data.action.receive',
}

const nextId = createCountFunc();

export type BleUartWriteAction = Action<BleUartActionType.Write> & {
    id: number;
    value: Uint8Array;
};

export function write(value: Uint8Array): BleUartWriteAction {
    return { type: BleUartActionType.Write, id: nextId(), value };
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

export type BleUartNotifyAction = Action<BleUartActionType.Notify> & {
    value: DataView;
};

export function notify(value: DataView): BleUartNotifyAction {
    return { type: BleUartActionType.Notify, value };
}

/** Common type for low-level BLE data actions. */
export type BleUartAction =
    | BleUartWriteAction
    | BleUartDidWriteAction
    | BleUartDidFailToWriteAction
    | BleUartNotifyAction;
