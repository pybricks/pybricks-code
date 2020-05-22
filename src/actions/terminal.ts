// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum TerminalDataActionType {
    /**
     * Send data.
     */
    SendData = 'terminal.data.send',
    /**
     * Data was received.
     */
    ReceivedData = 'terminal.data.receive',
}

export interface TerminalDataAction extends Action<TerminalDataActionType> {
    value: string;
}

export function sendData(data: string): TerminalDataAction {
    return { type: TerminalDataActionType.SendData, value: data };
}

export function receiveData(data: string): TerminalDataAction {
    return { type: TerminalDataActionType.ReceivedData, value: data };
}
