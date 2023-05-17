// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// Icon for indicating external links

import { Icon } from '@blueprintjs/core';
import React from 'react';

import './external-link.scss';

const ExternalLinkIcon: React.FunctionComponent = () => {
    return (
        <span className="pb-external-link">
            &nbsp;
            <sup>
                <Icon icon="share" iconSize={12} />
            </sup>
        </span>
    );
};

export default ExternalLinkIcon;
