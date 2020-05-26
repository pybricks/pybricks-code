// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { startRepl } from '../actions/hub';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';
import ActionButton, { ActionButtonProps } from './ActionButton';
import replIcon from './images/repl.svg';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

type StateProps = Pick<ActionButtonProps, 'enabled' | 'context'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled:
        state.hub.runtime === HubRuntimeState.Idle ||
        state.hub.runtime === HubRuntimeState.Error,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): void => {
        dispatch(startRepl());
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: 'Start REPL in terminal',
    icon: replIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
