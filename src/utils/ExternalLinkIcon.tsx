// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Icon for indicating external links

import { Icon } from '@blueprintjs/core';
import React from 'react';

import './external-link.scss';

class ExternalLinkIcon extends React.Component {
    render(): JSX.Element {
        return (
            <span className="pb-external-link">
                {' '}
                <sup>
                    <Icon icon="share" iconSize={12} />
                </sup>
            </span>
        );
    }
}

export default ExternalLinkIcon;
