// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';

export enum TerminalActionType {
    /**
     * Send data.
     */
    SendData = 'terminal.action.sendData',
    /**
     * Data was received.
     */
    ReceivedData = 'terminal.action.receiveData',
}

export type TerminalDataSendDataAction = Action<TerminalActionType.SendData> & {
    value: string;
};

export function sendData(data: string): TerminalDataSendDataAction {
    return { type: TerminalActionType.SendData, value: data };
}

export type TerminalDataReceiveDataAction = Action<TerminalActionType.ReceivedData> & {
    value: string;
};

export function receiveData(data: string): TerminalDataReceiveDataAction {
    return { type: TerminalActionType.ReceivedData, value: data };
}

export type TerminalDataAction =
    | TerminalDataSendDataAction
    | TerminalDataReceiveDataAction;
