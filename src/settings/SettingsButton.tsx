// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { connect } from 'react-redux';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import settingsIcon from './settings.svg';

type StateProps = undefined;
type DispatchProps = undefined;
type OwnProps = Pick<ActionButtonProps, 'id' | 'onAction'>;

const mergeProps = (
    _stateProps: StateProps,
    _dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: TooltipId.Settings,
    icon: settingsIcon,
    ...ownProps,
});

export default connect(undefined, undefined, mergeProps)(ActionButton);
