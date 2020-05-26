// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { Dispatch } from '../actions';
import * as editor from '../actions/editor';
import { RootState } from '../reducers';
import ActionButton, { ActionButtonProps } from './ActionButton';
import downloadIcon from './images/download.svg';

type StateProps = Pick<ActionButtonProps, 'enabled' | 'context'>;
type DispatchProps = Pick<ActionButtonProps, 'onAction'>;
type OwnProps = Pick<ActionButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.editor.current !== null,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAction: (): void => {
        dispatch(editor.save());
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): ActionButtonProps => ({
    tooltip: 'Save file',
    icon: downloadIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ActionButton);
