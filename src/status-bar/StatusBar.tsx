// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';

import './status-bar.scss';

const StatusBar: React.VFC = (_props) => {
    return (
        <div
            className="pb-status-bar"
            role="status"
            aria-live="off"
            onContextMenu={(e): void => e.preventDefault()}
        ></div>
    );
};

export default StatusBar;
