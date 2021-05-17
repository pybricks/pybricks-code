// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { connect } from 'react-redux';
import { toggleBluetooth } from '../ble/actions';
import { BleConnectionState } from '../ble/reducers';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import { RootState } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import btConnectedIcon from './bt-connected.svg';
import btDisconnectedIcon from './bt-disconnected.svg';

type StateProps = Pick<
    ActionButtonProps,
    'tooltip' | 'icon' | 'enabled' | 'showProgress'
>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;

const mapStateToProps = (state: RootState): StateProps => {
    if (
        state.ble.connection === BleConnectionState.Disconnected &&
        state.bootloader.connection === BootloaderConnectionState.Disconnected
    ) {
        return {
            tooltip: TooltipId.BluetoothConnect,
            icon: btDisconnectedIcon,
            enabled: true,
        };
    } else {
        return {
            tooltip: TooltipId.BluetoothDisconnect,
            icon: btConnectedIcon,
            enabled: state.ble.connection === BleConnectionState.Connected,
            showProgress: state.ble.connection === BleConnectionState.Connecting,
        };
    }
};

const mapDispatchToProps: DispatchProps = {
    onAction: toggleBluetooth,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
