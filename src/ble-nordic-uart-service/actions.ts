// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Actions for Bluetooth Low Energy Nordic UART service

import { createAction } from '../actions';

export const write = createAction((id: number, value: Uint8Array) => ({
    type: 'bleUart.action.write',
    id,
    value,
}));

export const didWrite = createAction((id: number) => ({
    type: 'bleUart.action.didWrite',
    id,
}));

export const didFailToWrite = createAction((id: number, err: Error) => ({
    type: 'bleUart.action.didFailToWrite',
    id,
    err,
}));
export const didNotify = createAction((value: DataView) => ({
    type: 'bleUart.action.didNotify',
    value,
}));
