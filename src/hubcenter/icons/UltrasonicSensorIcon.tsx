// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import _62_ultrasonic_sensor from './62_ultrasonic_sensor.png';
import { DeviceIconProps } from './DeviceIcon';

const UltrasonicSensorIconComponent: React.FunctionComponent<DeviceIconProps> = () => {
    return (
        <img
            src={_62_ultrasonic_sensor}
            alt="Ultrasonic Sensor"
            className="pb-device-icon pb-ultrasonic-sensor-icon"
        />
    );
};
export default UltrasonicSensorIconComponent;
