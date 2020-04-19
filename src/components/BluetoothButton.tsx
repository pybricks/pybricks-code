import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { connect as bleConnect, disconnect as bleDisconnect } from '../actions/ble';
import { RootState } from '../reducers';
import { BLEConnectionState } from '../reducers/ble';
import { BootloaderConnectionState } from '../reducers/bootloader';
import ActionButton, { ActionButtonProps } from './ActionButton';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

type ButtonProps = ActionButtonProps<string>;
type StateProps = Pick<ButtonProps, 'tooltip' | 'icon' | 'context' | 'enabled'>;
type DispatchProps = Pick<ButtonProps, 'onAction'>;

const mapStateToProps = (state: RootState): StateProps => {
    if (
        state.ble.connection === BLEConnectionState.Disconnected &&
        state.bootloader.connection === BootloaderConnectionState.Disconnected
    ) {
        return {
            tooltip: 'Connect using Bluetooth',
            icon: 'btdisconnected.svg',
            context: 'connect',
            enabled: true,
        };
    } else {
        return {
            tooltip: 'Disconnect Bluetooth',
            icon: 'btconnected.svg',
            context: 'disconnect',
            enabled: state.ble.connection === BLEConnectionState.Connected,
        };
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (c): void => {
        if (c === 'connect') {
            dispatch(bleConnect());
        } else {
            dispatch(bleDisconnect());
        }
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
