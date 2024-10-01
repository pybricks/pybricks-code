// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import _61_color_sensor from './61_color_sensor.png';
import { DeviceIconProps } from './DeviceIcon';

const ColorSensorIconComponent: React.FunctionComponent<DeviceIconProps> = ({
    data,
}) => {
    const colorCode = data?.values?.[0]?.replace('c=', '') || '';
    let bgcolor = '';
    switch (colorCode) {
        default:
        case 'NONE':
            bgcolor = 'url(#checked-pattern)';
            break;
        case 'BLACK':
            bgcolor = 'rgb(0, 0, 0)';
            break;
        case 'BLUE': // Medium azur
            bgcolor = 'rgb(104, 195, 226)';
            break;
        case 'RED':
            bgcolor = 'rgb(180, 0, 0)';
            break;
        case 'WHITE':
            bgcolor = 'rgb(244, 244, 244)';
            break;
        case 'CYAN':
            bgcolor = 'rgb(30, 90, 168)';
            break;
        case 'GREEN':
            bgcolor = 'rgb(0, 133, 43)';
            break;
        case 'YELLOW':
            bgcolor = 'rgb(250, 200, 10)';
            break;
        case 'VIOLET':
            bgcolor = 'rgb(144, 31, 118)';
            break;
    }

    return (
        <div className="pb-device-icon">
            <img src={_61_color_sensor} alt="Color Sensor" />

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="color-eye"
            >
                <g>
                    <circle fill={bgcolor} cx="24" cy="24" r="10" />
                </g>
            </svg>
        </div>
    );
};
export default ColorSensorIconComponent;
