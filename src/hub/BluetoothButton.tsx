// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleBluetooth } from '../ble/actions';
import { BleConnectionState } from '../ble/reducers';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import { RootState } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import btConnectedIcon from './bt-connected.svg';
import btDisconnectedIcon from './bt-disconnected.svg';

type BluetoothButtonProps = Pick<ActionButtonProps, 'id'>;

const BluetoothButton: React.FunctionComponent<BluetoothButtonProps> = (props) => {
    const bootloaderConnection = useSelector(
        (state: RootState) => state.bootloader.connection,
    );
    const bleConnection = useSelector((state: RootState) => state.ble.connection);

    const isDisconnected =
        bootloaderConnection === BootloaderConnectionState.Disconnected &&
        bleConnection === BleConnectionState.Disconnected;

    const dispatch = useDispatch();

    return (
        <ActionButton
            tooltip={
                isDisconnected
                    ? TooltipId.BluetoothConnect
                    : TooltipId.BluetoothDisconnect
            }
            icon={isDisconnected ? btDisconnectedIcon : btConnectedIcon}
            enabled={isDisconnected || bleConnection === BleConnectionState.Connected}
            showProgress={bleConnection === BleConnectionState.Connecting}
            onAction={() => dispatch(toggleBluetooth())}
            {...props}
        />
    );
};

export default BluetoothButton;
