import ActionButton from './ActionButton';
import { connect } from 'react-redux';
import { connect as bleConnect, disconnect as bleDisconnect } from '../actions/ble';
import { RootState } from '../reducers';
import { BLEConnectionState } from '../reducers/ble';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

interface StateProps {
    readonly tooltip: string;
    readonly icon: string;
    readonly action?: string;
    readonly enabled?: boolean;
}

interface DispatchProps {
    readonly onAction: (action?: string) => void;
}

const mapStateToProps = (state: RootState): StateProps => {
    if (state.ble.connection === BLEConnectionState.Disconnected) {
        return {
            tooltip: 'Connect using Bluetooth',
            icon: 'btdisconnected.svg',
            action: 'connect',
            enabled: true,
        };
    } else {
        return {
            tooltip: 'Disconnect Bluetooth',
            icon: 'btconnected.svg',
            action: 'disconnect',
            enabled: state.ble.connection === BLEConnectionState.Connected,
        };
    }
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (a): void => {
        if (a === 'connect') {
            dispatch(bleConnect());
        } else {
            dispatch(bleDisconnect());
        }
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionButton);
