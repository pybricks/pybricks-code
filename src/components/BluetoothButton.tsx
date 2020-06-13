// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { toggleBluetooth } from '../actions/ble';
import { RootState } from '../reducers';
import { BleConnectionState } from '../reducers/ble';
import { BootloaderConnectionState } from '../reducers/bootloader';
import ActionButton, { ActionButtonProps } from './ActionButton';
import { TooltipId } from './button-i18n';
import btConnectedIcon from './images/bt-connected.svg';
import btDisconnectedIcon from './images/bt-disconnected.svg';

type StateProps = Pick<ActionButtonProps, 'tooltip' | 'icon' | 'enabled'>;
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
        };
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): Action => dispatch(toggleBluetooth()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
