// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import { DeviceIconProps } from './DeviceIcon';

const ColorSensorIconComponent: React.FunctionComponent<DeviceIconProps> = ({
    devEntry,
    portData,
}) => {
    const h = parseInt(portData?.dataMap?.get('h') ?? '');
    const s = portData?.dataMap?.get('s');
    const v = portData?.dataMap?.get('v');
    const bgcolor = `hsl(${h}, ${s}, ${v})`;

    return (
        <div className="pb-device-icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="color-eye"
            >
                <defs>
                    <filter id="blur-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    </filter>
                </defs>
                <g>
                    <circle
                        fill={bgcolor}
                        cx="24"
                        cy="24"
                        r="20"
                        filter="url(#blur-filter)"
                    />
                </g>
            </svg>

            <img src={devEntry?.icon} alt={devEntry?.name} className="icon" />
        </div>
    );
};
export default ColorSensorIconComponent;
