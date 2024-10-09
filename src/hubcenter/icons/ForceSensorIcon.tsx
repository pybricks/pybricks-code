// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import _63_force_sensor from './63_force_sensor.png';
import { DeviceIconProps } from './DeviceIcon';

const ForceSensorIconComponent: React.FunctionComponent<DeviceIconProps> = () => {
    return (
        <img
            src={_63_force_sensor}
            alt="Force Sensor"
            className="pb-device-icon pb-force-sensor-icon"
        />
    );
};
export default ForceSensorIconComponent;
