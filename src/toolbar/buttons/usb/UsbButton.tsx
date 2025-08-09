// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { BleConnectionState } from '../../../ble/reducers';
import { BootloaderConnectionState } from '../../../lwp3-bootloader/reducers';
import { useSelector } from '../../../reducers';
import { usbToggle } from '../../../usb/actions';
import { UsbConnectionState } from '../../../usb/reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import connectedIcon from './connected.svg';
import disconnectedIcon from './disconnected.svg';
import { useI18n } from './i18n';

type UsbButtonProps = Pick<ActionButtonProps, 'id'>;

const UsbButton: React.FunctionComponent<UsbButtonProps> = ({ id }) => {
    const bootloaderConnection = useSelector((s) => s.bootloader.connection);
    const bleConnection = useSelector((s) => s.ble.connection);
    const usbConnection = useSelector((s) => s.usb.connection);

    const isUsbDisconnected = usbConnection === UsbConnectionState.Disconnected;
    const isEverythingDisconnected =
        isUsbDisconnected &&
        bootloaderConnection === BootloaderConnectionState.Disconnected &&
        bleConnection === BleConnectionState.Disconnected;

    const i18n = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            tooltip={i18n.translate(
                bleConnection !== BleConnectionState.Disconnected
                    ? 'tooltip.bluetoothConnected'
                    : isUsbDisconnected
                      ? 'tooltip.connect'
                      : 'tooltip.disconnect',
            )}
            icon={isUsbDisconnected ? disconnectedIcon : connectedIcon}
            enabled={
                isEverythingDisconnected ||
                usbConnection === UsbConnectionState.Connected
            }
            showProgress={
                usbConnection === UsbConnectionState.Connecting ||
                usbConnection === UsbConnectionState.Disconnecting
            }
            onAction={() => dispatch(usbToggle())}
        />
    );
};

export default UsbButton;
