// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleBluetooth } from '../../../ble/actions';
import { BleConnectionState } from '../../../ble/reducers';
import { BootloaderConnectionState } from '../../../lwp3-bootloader/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import connectedIcon from './connected.svg';
import disconnectedIcon from './disconnected.svg';
import { I18nId } from './i18n';

type BluetoothButtonProps = Pick<ActionButtonProps, 'id'>;

const BluetoothButton: React.VoidFunctionComponent<BluetoothButtonProps> = ({ id }) => {
    const bootloaderConnection = useSelector((s) => s.bootloader.connection);
    const bleConnection = useSelector((s) => s.ble.connection);

    const isDisconnected =
        bootloaderConnection === BootloaderConnectionState.Disconnected &&
        bleConnection === BleConnectionState.Disconnected;

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={i18n.translate(I18nId.Label)}
            tooltip={i18n.translate(
                isDisconnected ? I18nId.TooltipConnect : I18nId.TooltipDisconnect,
            )}
            icon={isDisconnected ? disconnectedIcon : connectedIcon}
            enabled={isDisconnected || bleConnection === BleConnectionState.Connected}
            showProgress={bleConnection === BleConnectionState.Connecting}
            onAction={() => dispatch(toggleBluetooth())}
        />
    );
};

export default BluetoothButton;
