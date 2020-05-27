// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { stop } from '../actions/hub';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';
import ActionButton, { ActionButtonProps } from './ActionButton';
import stopIcon from './images/stop.svg';

type StateProps = Pick<ActionButtonProps, 'enabled'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.hub.runtime === HubRuntimeState.Running,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): Action => dispatch(stop()),
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: 'Stop everything',
    icon: stopIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
