// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { stop } from '../actions/hub';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';
import ActionButton, { ActionButtonProps } from './ActionButton';

type Dispatch = ThunkDispatch<{}, {}, AnyAction>;

type StateProps = Pick<ActionButtonProps, 'enabled' | 'context'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.hub.runtime === HubRuntimeState.Running,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): void => {
        dispatch(stop());
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: 'Stop everything',
    icon: 'stop.svg',
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
