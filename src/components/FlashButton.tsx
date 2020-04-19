import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { RootState } from '../reducers';
import { flashFirmware } from '../actions/bootloader';
import { BootloaderConnectionState } from '../reducers/bootloader';
import OpenFileButton, { OpenFileButtonProps } from './OpenFileButton';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

type StateProps = Pick<OpenFileButtonProps, 'enabled'>;
type DispatchProps = Pick<OpenFileButtonProps, 'onFile'>;
type OwnProps = Pick<OpenFileButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.bootloader.connection === BootloaderConnectionState.Disconnected,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onFile: (data): void => {
        dispatch(flashFirmware(data));
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): OpenFileButtonProps => ({
    fileExtension: '.bin',
    tooltip: 'Flash hub firmware',
    icon: 'firmware.svg',
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OpenFileButton);
