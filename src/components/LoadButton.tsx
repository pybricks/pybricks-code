// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as editor from '../actions/editor';
import * as notification from '../actions/notification';
import { RootState } from '../reducers';
import OpenFileButton, { OpenFileButtonProps } from './OpenFileButton';
import openIcon from './images/open.svg';

type StateProps = Pick<OpenFileButtonProps, 'enabled'>;
type DispatchProps = Pick<OpenFileButtonProps, 'onFile' | 'onReject'>;
type OwnProps = Pick<OpenFileButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.editor.current !== null,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onFile: (data): void => {
        dispatch(editor.open(data));
    },
    onReject: (file): void => {
        dispatch(
            notification.add('error', `'${file.name}' is not a valid python file.`),
        );
    },
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): OpenFileButtonProps => ({
    fileExtension: '.py',
    tooltip: 'Load file',
    icon: openIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OpenFileButton);
