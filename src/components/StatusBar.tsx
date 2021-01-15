// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { ProgressBar } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../reducers';

import './status-bar.scss';

type StateProps = { progress: number };

type StatusProps = StateProps;

class StatusBar extends React.Component<StatusProps> {
    render(): JSX.Element {
        return (
            <div className="status-bar" onContextMenu={(e): void => e.preventDefault()}>
                <ProgressBar
                    className="status-bar-item"
                    value={this.props.progress}
                    animate={false}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    progress: state.status.progress,
});

export default connect(mapStateToProps)(StatusBar);
