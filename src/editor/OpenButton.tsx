// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { connect } from 'react-redux';
import * as notification from '../notifications/actions';
import { RootState } from '../reducers';
import OpenFileButton, { OpenFileButtonProps } from '../toolbar/OpenFileButton';
import { TooltipId } from '../toolbar/i18n';
import * as editor from './actions';
import openIcon from './open.svg';

type StateProps = Pick<OpenFileButtonProps, 'enabled'>;
type DispatchProps = Pick<OpenFileButtonProps, 'onFile' | 'onReject'>;
type OwnProps = Pick<OpenFileButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    enabled: state.editor.current !== null,
});

const mapDispatchToProps: DispatchProps = {
    onFile: editor.open,
    onReject: (file) =>
        notification.add('error', `'${file.name}' is not a valid python file.`),
};

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): OpenFileButtonProps => ({
    fileExtension: '.py',
    tooltip: TooltipId.Open,
    icon: openIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OpenFileButton);
