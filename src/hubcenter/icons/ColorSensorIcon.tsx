// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';

interface ColorSensorIconProps {
    colorCode: string | undefined;
}
const ColorSensorIconComponent: React.FunctionComponent<ColorSensorIconProps> = ({
    colorCode,
}) => {
    let bgcolor = '';
    let stroke = '0px';
    switch (colorCode) {
        default:
        case 'NONE':
            bgcolor = 'url(#checked-pattern)';
            stroke = '1px';
            break;
        case 'BLACK':
            bgcolor = 'rgb(0, 0, 0)';
            stroke = '1px';
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <g>
                <pattern
                    id="checked-pattern"
                    width="0.4"
                    height="0.4"
                    patternContentUnits="objectBoundingBox"
                    patternUnits="objectBoundingBox"
                >
                    <rect x="0.2" y="0" width="0.2" height="0.2" fill="#888" />
                    <rect x="0" y="0.2" width="0.2" height="0.2" fill="#888" />
                </pattern>

                <path
                    fill="#fff"
                    d="M 38 4 C 41.314 4 44 6.686 44 10 L 44 38 C 44 41.314 41.314 44 38 44 L 10 44 C 6.686 44 4 41.314 4 38 L 4 10 C 4 6.686 6.686 4 10 4 L 38 4 Z M 38 5.5 L 10 5.5 C 7.516 5.503 5.503 7.516 5.5 10 L 5.5 38 C 5.5 40.481 7.519 42.5 10 42.5 L 38 42.5 C 40.481 42.5 42.5 40.481 42.5 38 L 42.5 10 C 42.5 7.519 40.481 5.5 38 5.5 Z M 24 9 C 32.271 9 39 15.729 39 24 C 39 32.271 32.271 39 24 39 C 15.729 39 9 32.271 9 24 C 9 15.729 15.729 9 24 9 Z M 24 11 C 16.82 11 11 16.82 11 24 C 11 31.18 16.82 37 24 37 C 31.18 37 37 31.18 37 24 C 37 16.82 31.18 11 24 11 Z"
                />
                <path
                    fill={bgcolor}
                    stroke="#fff"
                    strokeWidth={stroke}
                    d="M 34 24 C 34 29.522 29.523 34 24 34 C 18.477 34 14 29.522 14 24 C 14 18.478 18.477 14 24 14 C 29.523 14 34 18.478 34 24 Z"
                    transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)"
                />
            </g>
        </svg>
    );
};
export default ColorSensorIconComponent;
