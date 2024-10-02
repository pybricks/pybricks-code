// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import { DeviceIconProps } from './DeviceIcon';

export interface MotorIconProps extends DeviceIconProps {
    side: 'left' | 'right';
}

const MotorIconComponent: React.FunctionComponent<MotorIconProps> = ({
    devEntry,
    portData,
    side,
}) => {
    function getShaftStyle() {
        const angle = parseInt(portData?.dataMap?.get('a') || '');
        return {
            '--rotate': `${angle}deg`,
        } as React.CSSProperties;
    }

    return (
        <div
            className={`pb-device-icon ${
                side === 'right' && devEntry?.canRotate ? 'pb-device-icon-rotated' : ''
            }`}
        >
            <img src={devEntry?.icon} className="icon" />
            <img
                src={devEntry?.iconShaft}
                className={devEntry?.classShaft}
                style={getShaftStyle()}
            />
        </div>
    );
};
export default MotorIconComponent;
