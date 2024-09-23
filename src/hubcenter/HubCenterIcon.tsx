// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';

interface HubIconProps {
    buttons: string[];
}
const HubIconComponent: React.FunctionComponent<HubIconProps> = ({ buttons }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="10 3 28 42"
            className="pb-hub-icon"
        >
            <g fill="none" strokeWidth={0.5}>
                <path
                    id="button_bluetooth"
                    stroke="#fff"
                    d="M33.398 9.049c0 .83-.667 1.5-1.49 1.5-.824 0-1.49-.67-1.49-1.5 0-.829.666-1.5 1.49-1.5.823 0 1.49.674 1.49 1.5"
                    fill={buttons.includes('B') ? '#fff' : 'none'}
                />
                <path
                    id="button_center"
                    stroke="#fff"
                    d="M27 37c0 1.659-1.342 3-3 3s-3-1.341-3-3 1.342-3 3-3 3 1.349 3 3"
                    fill={buttons.includes('C') ? '#fff' : 'none'}
                />
                <path
                    id="button_l"
                    d="M 19.471 38.464 L 15.409 38.464 C 14.943 38.464 14.565 37.937 14.565 37.288 L 14.565 36.699 C 14.565 36.049 14.943 35.522 15.409 35.522 L 19.471 35.522 C 19.28 35.966 19.179 36.475 19.18 36.993 C 19.18 37.53 19.286 38.034 19.471 38.464 Z"
                    stroke={buttons.includes('L') ? '#fff' : 'none'}
                    fill={buttons.includes('L') ? '#fff' : 'none'}
                />
                <path
                    id="button_r"
                    d="M 28.528 35.522 L 32.59 35.522 C 33.056 35.522 33.434 36.049 33.434 36.699 L 33.434 37.288 C 33.434 37.937 33.056 38.464 32.59 38.464 L 28.528 38.464 C 28.719 38.019 28.82 37.511 28.819 36.993 C 28.82 36.475 28.719 35.966 28.528 35.522 Z"
                    stroke={buttons.includes('R') ? '#fff' : 'none'}
                    fill={buttons.includes('R') ? '#fff' : 'none'}
                />

                <path
                    id="outline"
                    stroke="#fff"
                    d="M33.1 44H14.9c-2.15 0-3.9-1.717-3.9-3.75V7.75C11 5.716 12.75 4 14.9 4h18.2C35.249 4 37 5.716 37 7.75v32.5c0 2.033-1.751 3.75-3.9 3.75z"
                />
                <path
                    id="pixels"
                    fill="#fff"
                    d="M22.41 17.384h3.08v-3.079h-3.08v3.079zm0 4.105h3.08V18.41h-3.08v3.08zm0 4.106h3.08v-3.079h-3.08v3.079zm-4.105-8.211h3.079v-3.079h-3.079v3.079zm0 4.105h3.079V18.41h-3.079v3.08zm0 4.106h3.079v-3.079h-3.079v3.079zm8.211-8.211h3.079v-3.079h-3.079v3.079zm0 4.105h3.079V18.41h-3.079v3.08zm0 4.106h3.079v-3.079h-3.079v3.079z"
                />
            </g>
        </svg>
    );
};

export default HubIconComponent;
