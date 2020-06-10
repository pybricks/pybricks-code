// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action, Observable } from 'redux';

export enum TerminalActionType {
    /**
     * Set the current data source.
     */
    SetDataSource = 'terminal.action.setDataSource',
    /**
     * Send data.
     */
    SendData = 'terminal.action.sendData',
    /**
     * Data was received.
     */
    ReceivedData = 'terminal.action.receiveData',
}

export interface TerminalSetDataSourceAction
    extends Action<TerminalActionType.SetDataSource> {
    dataSource: Observable<string>;
}

export function setDataSource(
    dataSource: Observable<string>,
): TerminalSetDataSourceAction {
    return { type: TerminalActionType.SetDataSource, dataSource };
}

export interface TerminalDataSendDataAction
    extends Action<TerminalActionType.SendData> {
    value: string;
}

export function sendData(data: string): TerminalDataSendDataAction {
    return { type: TerminalActionType.SendData, value: data };
}

export interface TerminalDataReceiveDataAction
    extends Action<TerminalActionType.ReceivedData> {
    value: string;
}

export function receiveData(data: string): TerminalDataReceiveDataAction {
    return { type: TerminalActionType.ReceivedData, value: data };
}

export type TerminalDataAction =
    | TerminalSetDataSourceAction
    | TerminalDataSendDataAction
    | TerminalDataReceiveDataAction;
