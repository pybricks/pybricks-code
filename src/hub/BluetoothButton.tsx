// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleBluetooth } from '../ble/actions';
import { BleConnectionState } from '../ble/reducers';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { I18nId } from '../toolbar/i18n';
import btConnectedIcon from './bt-connected.svg';
import btDisconnectedIcon from './bt-disconnected.svg';

type BluetoothButtonProps = Pick<ActionButtonProps, 'label'>;

const BluetoothButton: React.VoidFunctionComponent<BluetoothButtonProps> = ({
    label,
}) => {
    const bootloaderConnection = useSelector((s) => s.bootloader.connection);
    const bleConnection = useSelector((s) => s.ble.connection);

    const isDisconnected =
        bootloaderConnection === BootloaderConnectionState.Disconnected &&
        bleConnection === BleConnectionState.Disconnected;

    const dispatch = useDispatch();

    return (
        <ActionButton
            label={label}
            tooltip={
                isDisconnected ? I18nId.BluetoothConnect : I18nId.BluetoothDisconnect
            }
            icon={isDisconnected ? btDisconnectedIcon : btConnectedIcon}
            enabled={isDisconnected || bleConnection === BleConnectionState.Connected}
            showProgress={bleConnection === BleConnectionState.Connecting}
            onAction={() => dispatch(toggleBluetooth())}
        />
    );
};

export default BluetoothButton;
