// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import hub_city from './hub_city.png';
import hub_large_spike from './hub_large_spike.png';
import hub_large_technic from './hub_large_technic.png';
import hub_small from './hub_small.png';
import hub_technic from './hub_technic.png';

interface HubIconProps {
    deviceType: string;
    hubImuData: string;
}

export function getHubPortCount(deviceType: string) {
    switch (deviceType) {
        // case 'Move hub':
        //     return 4;
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
    hubImuData,
}) => {
    function getDeviceIcon() {
        switch (deviceType) {
            // case 'Move hub':
            //     return;
            case 'City hub':
                return hub_city;
            case 'Technic hub':
                return hub_technic;
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
            <div>{hubImuData}</div>
        </div>
    );
};

export default HubIconComponent;
