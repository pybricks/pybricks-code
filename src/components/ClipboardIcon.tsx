// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Icon for indicating external links

import { Icon } from '@blueprintjs/core';
import React from 'react';

import './clipboard.scss';

const ClipboardIcon: React.VFC = (_props) => {
    return (
        <span className="pb-clipboard">
            &nbsp;
            <sup>
                <Icon icon="duplicate" iconSize={12} />
            </sup>
        </span>
    );
};

export default ClipboardIcon;
