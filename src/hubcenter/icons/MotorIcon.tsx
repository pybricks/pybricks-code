// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';

interface MotorIconProps {
    speed: number;
}
const MotorIconComponent: React.FunctionComponent<MotorIconProps> = ({ speed }) => {
    const animation = React.useRef('');
    animation.current =
        Math.abs(speed) < 5
            ? animation.current
            : speed >= 0
              ? 'motor-spin-cw'
              : 'motor-spin-ccw';
    const astyle = {
        animation: `${animation.current} 5s linear infinite ${
            Math.abs(speed) > 5 ? 'running' : 'paused'
        }`,
    };
    // console.log(astyle);
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={astyle}>
            <g fillRule="evenodd" transform="translate(2 2)">
                <circle cx={22} cy={22} r={21} fill="none" />
                <path
                    fill="#fff"
                    d="M22 0c12.15 0 22 9.85 22 22s-9.85 22-22 22S0 34.15 0 22 9.85 0 22 0zm0 1.5C10.696 1.5 1.5 10.696 1.5 22S10.696 42.5 22 42.5 42.5 33.304 42.5 22 33.304 1.5 22 1.5zm0 26.75a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm-12-12a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm24 0a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm-12.132 1.757.116-.007a1 1 0 0 1 .994.883l.006.117v1.97H25a1 1 0 0 1 .993.884l.007.117a1 1 0 0 1-.883.993l-.117.007-2.016-.001V25a1 1 0 0 1-.883.993l-.117.007a1 1 0 0 1-.993-.883L20.984 25v-2.03h-2.015a1 1 0 0 1-.993-.883l-.007-.116a1 1 0 0 1 .883-.994l.117-.006 2.015-.001V19a1 1 0 0 1 .884-.993l.116-.007zM22 4.25a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5z"
                />
            </g>
        </svg>
    );
};
export default MotorIconComponent;
