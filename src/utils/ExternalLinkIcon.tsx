// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Icon for indicating external links

import { Icon } from '@blueprintjs/core';
import React from 'react';

import './external-link.scss';

class ExternalLinkIcon extends React.Component {
    render(): JSX.Element {
        return (
            <sup className="pb-external-link">
                <Icon icon="share" iconSize={12} />
            </sup>
        );
    }
}

export default ExternalLinkIcon;
