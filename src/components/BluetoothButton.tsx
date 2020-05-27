// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { toggleBluetooth } from '../actions/ble';
import { RootState } from '../reducers';
import { BLEConnectionState } from '../reducers/ble';
import { BootloaderConnectionState } from '../reducers/bootloader';
import ActionButton, { ActionButtonProps } from './ActionButton';
import btConnectedIcon from './images/bt-connected.svg';
import btDisconnectedIcon from './images/bt-disconnected.svg';

type StateProps = Pick<ActionButtonProps, 'tooltip' | 'icon' | 'enabled'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;

const mapStateToProps = (state: RootState): StateProps => {
    if (
        state.ble.connection === BLEConnectionState.Disconnected &&
        state.bootloader.connection === BootloaderConnectionState.Disconnected
    ) {
        return {
            tooltip: 'Connect using Bluetooth',
            icon: btDisconnectedIcon,
            enabled: true,
        };
    } else {
        return {
            tooltip: 'Disconnect Bluetooth',
            icon: btConnectedIcon,
            enabled: state.ble.connection === BLEConnectionState.Connected,
        };
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): Action => dispatch(toggleBluetooth()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
