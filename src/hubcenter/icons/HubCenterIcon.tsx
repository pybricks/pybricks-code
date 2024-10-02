// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import hub_large_spike from './hub_large.png';
import hub_large_technic from './hub_large_technic.png';
import hub_small from './hub_small.png';

interface HubIconProps {
    deviceType: string;
    buttons: string[];
}

export function getHubPortCount(deviceType: string) {
    switch (deviceType) {
        case 'Move hub':
            return 4;
        case 'City hub': //88009
            return 2;
        case 'Technic hub': // 88012
            return 4;
        case 'Prime hub':
        case 'Inventor hub':
            return 6;
        case 'Essential hub':
            return 2;
        default:
            return 0;
    }
}

const HubIconComponent: React.FunctionComponent<HubIconProps> = ({
    deviceType,
    buttons,
}) => {
    function getDeviceIcon() {
        switch (deviceType) {
            case 'Move hub':
                return;
            case 'City hub':
                return;
            case 'Technic hub':
                return;
            case 'Prime hub':
                return hub_large_spike;
            case 'Inventor hub':
                return hub_large_technic;
            case 'Essential hub':
                return hub_small;
            default:
                return;
        }
    }

    return (
        <div className="pb-hub-icon">
            <img src={getDeviceIcon()} alt="Hub" className="hubIcon" />

            {deviceType === 'Prime hub' || deviceType === 'Inventor hub' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="10 3 28 42"
                    className="hubOverlay"
                >
                    <g fill="none" strokeWidth={0.5}>
                        <circle
                            id="button_bluetooth"
                            stroke="none"
                            fill={
                                buttons?.includes('BLUETOOTH')
                                    ? 'rgba(127,127,127,0.5)'
                                    : 'none'
                            }
                            cx="31.7"
                            r="1.95"
                            cy="8.75"
                        />
                        <g
                            id="button_group"
                            style={{
                                transformOrigin: '24px 26px',
                            }}
                            transform="scale(1.2)"
                        >
                            <path
                                id="button_center"
                                d="M27 37c0 1.659-1.342 3-3 3s-3-1.341-3-3 1.342-3 3-3 3 1.349 3 3"
                                fill={
                                    buttons?.includes('CENTER')
                                        ? 'rgba(127,127,127,0.5)'
                                        : 'none'
                                }
                            />
                            <path
                                id="button_l"
                                d="M 19.471 38.464 L 15.409 38.464 C 14.943 38.464 14.565 37.937 14.565 37.288 L 14.565 36.699 C 14.565 36.049 14.943 35.522 15.409 35.522 L 19.471 35.522 C 19.28 35.966 19.179 36.475 19.18 36.993 C 19.18 37.53 19.286 38.034 19.471 38.464 Z"
                                fill={
                                    buttons?.includes('LEFT')
                                        ? 'rgba(127,127,127,0.5)'
                                        : 'none'
                                }
                            />
                            <path
                                id="button_r"
                                d="M 28.528 35.522 L 32.59 35.522 C 33.056 35.522 33.434 36.049 33.434 36.699 L 33.434 37.288 C 33.434 37.937 33.056 38.464 32.59 38.464 L 28.528 38.464 C 28.719 38.019 28.82 37.511 28.819 36.993 C 28.82 36.475 28.719 35.966 28.528 35.522 Z"
                                fill={
                                    buttons?.includes('RIGHT')
                                        ? 'rgba(127,127,127,0.5)'
                                        : 'none'
                                }
                            />
                        </g>

                        <path
                            id="pixels"
                            fill="rgba(200, 127, 0, 0.2)"
                            d="M22.41 17.384h3.08v-3.079h-3.08v3.079zm0 4.105h3.08V18.41h-3.08v3.08zm0 4.106h3.08v-3.079h-3.08v3.079zm-4.105-8.211h3.079v-3.079h-3.079v3.079zm0 4.105h3.079V18.41h-3.079v3.08zm0 4.106h3.079v-3.079h-3.079v3.079zm8.211-8.211h3.079v-3.079h-3.079v3.079zm0 4.105h3.079V18.41h-3.079v3.08zm0 4.106h3.079v-3.079h-3.079v3.079z"
                        />
                    </g>
                </svg>
            ) : (
                <svg></svg>
            )}
        </div>
    );
};

export default HubIconComponent;
