// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { connect } from 'react-redux';

import './status-bar.scss';

class StatusBar extends React.Component {
    render(): JSX.Element {
        return (
            <div
                className="pb-status-bar"
                role="status"
                aria-live="off"
                onContextMenu={(e): void => e.preventDefault()}
            ></div>
        );
    }
}

export default connect()(StatusBar);
