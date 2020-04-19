import { Ace } from 'ace-builds';
import { batch, connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { downloadAndRun } from '../actions/hub';
import { compile } from '../actions/mpy';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';
import ActionButton, { ActionButtonProps } from './ActionButton';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

type ButtonProps = ActionButtonProps<Ace.EditSession>;
type StateProps = Pick<ButtonProps, 'enabled' | 'context'>;
type DispatchProps = Pick<ButtonProps, 'onAction'>;
type OwnProps = Pick<ButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled:
        state.editor.current !== null && state.hub.runtime === HubRuntimeState.Idle,
    context: state.editor.current || undefined,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (c): void => {
        if (!c) {
            console.error('No current editor');
            return;
        }
        batch(() => {
            const script = c.getValue();
            const mpy = dispatch(compile(script));
            dispatch(downloadAndRun(mpy.data));
        });
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ButtonProps => ({
    tooltip: 'Download and run this program',
    icon: 'run.svg',
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
