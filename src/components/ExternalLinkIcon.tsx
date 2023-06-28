// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// Icon for indicating external links

import './external-link.scss';
import { Icon } from '@blueprintjs/core';
import { Share } from '@blueprintjs/icons';
import React from 'react';

const ExternalLinkIcon: React.FunctionComponent = () => {
    return (
        <span className="pb-external-link">
            &nbsp;
            <sup>
                <Icon icon={<Share size={12} />} />
            </sup>
        </span>
    );
};

export default ExternalLinkIcon;
