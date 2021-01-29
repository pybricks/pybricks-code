// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { connect } from 'react-redux';
import { openSettings as openSettings } from '../app/actions';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import settingsIcon from './settings.svg';

type StateProps = undefined;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapDispatchToProps: DispatchProps = {
    onAction: openSettings,
};

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
