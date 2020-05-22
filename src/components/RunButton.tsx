// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { downloadAndRun } from '../actions/hub';
import { compile } from '../actions/mpy';
import * as notification from '../actions/notification';
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
        const script = c.getValue();
        // TODO: need to get options from hub because they depend on firmware compile options
        dispatch(compile(script, ['-mno-unicode']))
            .then((mpy) => {
                if (mpy.data) {
                    dispatch(downloadAndRun(mpy.data));
                } else {
                    dispatch(
                        notification.add('error', mpy.err || 'Unknown compiler error.'),
                    );
                }
            })
            .catch((err) => console.error(err));
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
