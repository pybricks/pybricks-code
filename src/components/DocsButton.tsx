// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: components/DocsButton.ts
// Toolbar button for toggling documentation.

import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { toggleDocs } from '../actions/app';
import ActionButton, { ActionButtonProps } from './ActionButton';
import { TooltipId } from './button-i18n';
import docsIcon from './images/run.svg'; // FIXME: need proper icon

type StateProps = undefined;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): Action => dispatch(toggleDocs()),
});

const mergeProps = (
    _stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: TooltipId.Docs,
    icon: docsIcon,
    ...ownProps,
    ...dispatchProps,
});

export default connect(undefined, mapDispatchToProps, mergeProps)(ActionButton);
