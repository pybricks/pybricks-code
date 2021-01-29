// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { RootState } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { downloadAndRun } from './actions';
import { HubRuntimeState } from './reducers';
import runIcon from './run.svg';

type StateProps = Pick<ActionButtonProps, 'enabled'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'> &
    Pick<ActionButtonProps, 'keyboardShortcut'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled:
        state.editor.current !== null && state.hub.runtime === HubRuntimeState.Idle,
});

const mapDispatchToProps: DispatchProps = {
    onAction: downloadAndRun,
};

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: TooltipId.Run,
    icon: runIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
