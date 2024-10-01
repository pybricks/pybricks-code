// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import { PortData } from '../PortComponent';

export interface DeviceIconProps {
    name: string;
    data: PortData | undefined;
}
const DeviceIcon: React.FunctionComponent<DeviceIconProps> = ({ name }) => {
    return (
        <div className="pb-device-icon">
            <div>{name}</div>
            <br />
        </div>
    );
};
export default DeviceIcon;
