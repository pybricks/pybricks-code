// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    BootloaderConnectionActionType,
    BootloaderRequestActionType,
    BootloaderResponseActionType,
} from '../actions/bootloader';

/**
 * Describes the state of the bootloader connection.
 */
export enum BootloaderConnectionState {
    /**
     * No device is connected.
     */
    Disconnected = 'bootloader.connection.disconnected',
    /**
     * Connecting to a device.
     */
    Connecting = 'bootloader.connection.connecting',
    /**
     * Connected to a device.
     */
    Connected = 'bootloader.connection.connected',
    /**
     * Disconnecting from a device.
     */
    Disconnecting = 'bootloader.connection.disconnecting',
}

const connection: Reducer<BootloaderConnectionState> = (
    state = BootloaderConnectionState.Disconnected,
    action,
) => {
    switch (action.type) {
        case BootloaderConnectionActionType.Connect:
            return BootloaderConnectionState.Connecting;
        case BootloaderConnectionActionType.DidConnect:
            return BootloaderConnectionState.Connected;
        case BootloaderRequestActionType.Reboot:
        case BootloaderRequestActionType.Disconnect:
            return BootloaderConnectionState.Disconnecting;
        case BootloaderConnectionActionType.DidDisconnect:
        case BootloaderConnectionActionType.DidCancel:
            return BootloaderConnectionState.Disconnected;
        case BootloaderConnectionActionType.DidError:
            // Error while connecting means we didn't connect.
            if (state === BootloaderConnectionState.Connecting) {
                return BootloaderConnectionState.Disconnected;
            } else {
                return state;
            }
        default:
            return state;
    }
};

export enum FirmwareFlashState {
    /**
     * Erase command has been sent.
     */
    BeginErase = 'bootloader.flash.erase.begin',
    /**
     * Erase result has been received.
     */
    EndErase = 'bootloader.flash.erase.end',
    /**
     * Program command has been sent.
     */
    BeginProgram = 'bootloader.flash.program.begin',
    /**
     * Program result has been received.
     */
    EndProgram = 'bootloader.flash.program.end',
    /**
     * Reboot command has been sent. (no matching end state - becomes disconnected)
     */
    BeginReboot = 'bootloader.flash.reboot.begin',
    /**
     * Init command has been sent.
     */
    BeginInit = 'bootloader.flash.init.begin',
    /**
     * Init result has been received.
     */
    EndInit = 'bootloader.flash.init.end',
    /**
     * Info command has been sent.
     */
    BeginInfo = 'bootloader.flash.info.begin',
    /**
     * Info result has been received.
     */
    EndInfo = 'bootloader.flash.info.end',
    /**
     * Checksum command has been sent.
     */
    BeginChecksum = 'bootloader.flash.checksum.begin',
    /**
     * Checksum result has been received.
     */
    EndChecksum = 'bootloader.flash.checksum.end',
    /**
     * State command has been sent.
     */
    BeginState = 'bootloader.flash.state.begin',
    /**
     * State result has been received.
     */
    EndState = 'bootloader.flash.state.end',
    /**
     * Disconnect command has been sent. (no reply is received - becomes disconnected)
     */
    BeginDisconnect = 'bootloader.flash.disconnect.begin',
    /**
     * Bootloader is not connected.
     */
    EndDisconnect = 'bootloader.flash.disconnect.end',
    /**
     * An error was received.
     */
    Error = 'bootloader.flash.error',
}

const flash: Reducer<FirmwareFlashState> = (
    state = FirmwareFlashState.EndDisconnect,
    action,
) => {
    switch (action.type) {
        case BootloaderRequestActionType.Erase:
            return FirmwareFlashState.BeginErase;
        case BootloaderResponseActionType.Erase:
            return FirmwareFlashState.EndErase;
        case BootloaderRequestActionType.Program:
            return FirmwareFlashState.BeginProgram;
        case BootloaderResponseActionType.Program:
            return FirmwareFlashState.EndProgram;
        case BootloaderRequestActionType.Reboot:
            return FirmwareFlashState.BeginReboot;
        case BootloaderRequestActionType.Init:
            return FirmwareFlashState.BeginInit;
        case BootloaderResponseActionType.Init:
            return FirmwareFlashState.EndInit;
        case BootloaderRequestActionType.Info:
            return FirmwareFlashState.BeginInfo;
        case BootloaderResponseActionType.Info:
            return FirmwareFlashState.EndInfo;
        case BootloaderRequestActionType.Checksum:
            return FirmwareFlashState.BeginChecksum;
        case BootloaderResponseActionType.Checksum:
            return FirmwareFlashState.EndChecksum;
        case BootloaderRequestActionType.State:
            return FirmwareFlashState.BeginState;
        case BootloaderResponseActionType.State:
            return FirmwareFlashState.EndState;
        case BootloaderRequestActionType.Disconnect:
            return FirmwareFlashState.BeginDisconnect;
        case BootloaderConnectionActionType.DidDisconnect:
            return FirmwareFlashState.EndDisconnect;
        case BootloaderResponseActionType.Error:
            return FirmwareFlashState.Error;
        default:
            return state;
    }
};

export interface BootloaderState {
    readonly connection: BootloaderConnectionState;
    readonly flash: FirmwareFlashState;
}

export default combineReducers({ connection, flash });
