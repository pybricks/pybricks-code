// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import React from 'react';
import ColorSensorIconComponent from './icons/ColorSensorIcon';
import ForceSensorIcon from './icons/ForceSensorIcon';
import MotorIcon from './icons/MotorIcon';
import UltrasonicSensorIcon from './icons/UltrasonicSensorIcon';

export interface PortData {
    type: number | undefined;
    values: string[] | undefined;
    lastUpdated?: Date;
}

const DEVICE_NAMES: { [key: number]: string } = {
    1: 'Wedo 2.0\nMedium Motor',
    2: 'Powered Up\nTrain Motor',
    8: 'Powered Up\nLight',
    34: 'Wedo 2.0\nTilt Sensor',
    35: 'Wedo 2.0\nInfrared Motion Sensor',
    37: 'BOOST\nColor Distance Sensor',
    38: 'BOOST\nInteractive Motor',
    46: 'Technic\nLarge Motor',
    47: 'Technic\nExtra Large Motor',
    48: 'SPIKE\nMedium Angular Motor',
    49: 'SPIKE\nLarge Angular Motor',
    61: 'SPIKE\nColor Sensor',
    62: 'SPIKE\nUltrasonic Sensor',
    63: 'SPIKE\nForce Sensor',
    64: 'SPIKE\n3x3 Color Light Matrix',
    65: 'SPIKE\nSmall Angular Motor',
    75: 'Technic\nMedium Angular Motor',
    76: 'Technic\nLarge Angular Motor',
};

interface PortComponentProps {
    port: string;
    data: Map<string, PortData> | undefined;
}

const PortComponent: React.FunctionComponent<PortComponentProps> = ({ port, data }) => {
    const data1 = data?.get(port);

    try {
        // get name based on puptype
        const name = DEVICE_NAMES[data1?.type || 0] || '';

        // get Icon component based on puptype
        let iconComponent;
        switch (data1?.type) {
            // 34, 35, 37,
            case 38:
            case 46:
            case 47:
            case 48:
            case 49:
            case 65:
            case 75:
            case 76:
                {
                    // Any motor with rotation sensors.
                    const speed = parseInt(
                        data1?.values?.[1]?.match(/([-0-9.]+)/)?.[1] || '',
                    );
                    iconComponent = <MotorIcon speed={speed}></MotorIcon>;
                }
                break;
            case 61:
                // SPIKE Prime / MINDSTORMS Robot Inventor Color Sensor
                {
                    const color = data1.values?.[0]?.replace('c=', '') || '';
                    iconComponent = (
                        <ColorSensorIconComponent
                            colorCode={color}
                        ></ColorSensorIconComponent>
                    );
                }
                break;
            case 62:
                // SPIKE Prime / MINDSTORMS Robot Inventor Ultrasonic Sensor
                iconComponent = <UltrasonicSensorIcon></UltrasonicSensorIcon>;
                break;
            case 63:
                // SPIKE Prime Force Sensor
                iconComponent = <ForceSensorIcon></ForceSensorIcon>;
                break;
            default:
                iconComponent = <></>;
                break;
        }

        return (
            <>
                <div className="port-name">{name}</div>
                <div className="port-icon">{iconComponent}</div>
                <div className="port-value">{data1?.values?.join(', ')}</div>
            </>
        );
    } catch (e) {
        return <></>;
    }
};

export default PortComponent;
