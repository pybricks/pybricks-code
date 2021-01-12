// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { openSettings as openSettings } from '../actions/app';
import ActionButton, { ActionButtonProps } from './ActionButton';
import { TooltipId } from './button-i18n';
import settingsIcon from './images/settings.svg';

type StateProps = undefined;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): Action => dispatch(openSettings()),
});

const mergeProps = (
    _stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: TooltipId.Settings,
    icon: settingsIcon,
    ...dispatchProps,
    ...ownProps,
});

export default connect(undefined, mapDispatchToProps, mergeProps)(ActionButton);
