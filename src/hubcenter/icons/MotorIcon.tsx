// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import _48_medium_motor from './48_medium_motor.png';
import _48_motor_shaft from './48_motor_shaft.png';
import _49_large_motor from './49_large_motor.png';
import _75_medium_motor from './75_medium_motor.png';
import _75_motor_shaft from './75_motor_shaft.png';
import _76_large_motor from './76_large_motor.png';
import { DeviceIconProps } from './DeviceIcon';

export interface MotorIconProps extends DeviceIconProps {
    side: 'left' | 'right';
}

const MotorIconComponent: React.FunctionComponent<MotorIconProps> = ({
    data,
    side,
}) => {
    function motorIcon() {
        switch (data?.type) {
            // case 38:
            // case 46:
            // case 47:
            case 48:
                return [_48_medium_motor, _48_motor_shaft];
            case 49:
                return [_49_large_motor, _48_motor_shaft];
            // case 65:
            case 75:
                return [_75_medium_motor, _75_motor_shaft];
            case 76:
                return [_76_large_motor, _75_motor_shaft];
        }
    }

    function getShaftStyle() {
        const angle = parseInt(data?.values?.[0]?.match(/a=([-0-9.]+)/)?.[1] || '');
        return {
            transform: `rotate(${angle}deg)`,
        };
    }

    return (
        <div className={`pb-device-icon pb-device-motor-${side}`}>
            <img src={motorIcon()?.[0]} className="motor-base" />
            <img
                src={motorIcon()?.[1]}
                className="motor-shaft"
                style={getShaftStyle()}
            />
        </div>
    );
};
export default MotorIconComponent;
