// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import React from 'react';
import ColorSensorIconComponent from './ColorSensorIcon';
import MotorIcon from './MotorIcon';
import forcesensorIcon from './forcesensor.svg';
// import motorIcon from './motor.svg';
import ussensorIcon from './ussensor.svg';

interface PortComponentProps {
    port: string;
    porttype: number | undefined;
    portvalues: string[] | undefined;
}

const DEVICE_NAMES: { [key: number]: string[] } = {
    // 1: 'Wedo 2.0 Medium Motor',
    // 2: 'Powered Up Train Motor',
    // 8: 'Powered Up Light',
    // 38: 'BOOST Interactive Motor',
    // 46: 'Technic Large Motor',
    // 47: 'Technic Extra Large Motor',
    48: ['SPIKE Medium Angular Motor', 'M-MOTOR'],
    49: ['SPIKE Large Angular Motor', 'L-MOTOR'],
    65: ['SPIKE Small Angular Motor', 'S-MOTOR'],
    75: ['Technic Medium Angular Motor', 'M-MOTOR'],
    76: ['Technic Large Angular Motor', 'L-MOTOR'],
    // 34: 'Wedo 2.0 Tilt Sensor',
    // 35: 'Wedo 2.0 Infrared Motion Sensor',
    // 37: 'BOOST Color Distance Sensor',
    61: ['SPIKE Color Sensor', 'COL-COLOR'],
    62: ['SPIKE Ultrasonic Sensor', 'US-DIST'],
    63: ['SPIKE Force Sensor', 'FORCE-N'],
    // 64: ['SPIKE 3x3 Color Light Matrix',
};

const PortComponent: React.FunctionComponent<PortComponentProps> = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    port,
    porttype,
    portvalues,
}) => {
    // debugger;
    if (!porttype) {
        return <></>;
    }

    const getIcon = () => {
        switch (porttype) {
            case 48: // SPIKE Medium Angular Motor
            case 49: // SPIKE Large Angular Motor
            case 65: // SPIKE Small Angular Motor
            case 75: // Technic Medium Angular Motor
            case 76: // Technic Large Angular Motor
                return <MotorIcon speed={parseInt(portvalues?.[1] || '')}></MotorIcon>;
            case 63: // SPIKE Force Sensor
                return <img src={forcesensorIcon} />;
            case 61: {
                // SPIKE Color Sensor
                const color = parseInt(portvalues?.[0] || '');
                return (
                    <ColorSensorIconComponent
                        colorCode={color}
                    ></ColorSensorIconComponent>
                );
            }
            case 62: // SPIKE Ultrasonic Sensor
                return <img src={ussensorIcon} />;
            default:
                return <></>;
        }
    };
    const names = DEVICE_NAMES[porttype];
    return (
        <div title={names[0]}>
            <div>{names[1]}</div>
            <div>{getIcon()}</div>
            <div className="value">{portvalues?.[0]}</div>
        </div>
    );
};

export default PortComponent;
