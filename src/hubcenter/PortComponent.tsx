// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import React from 'react';
import ColorSensorIconComponent from './icons/ColorSensorIcon';
import DeviceIcon from './icons/DeviceIcon';
import ForceSensorIcon from './icons/ForceSensorIcon';
import MotorIcon from './icons/MotorIcon';
import UltrasonicSensorIcon from './icons/UltrasonicSensorIcon';

export interface PortData {
    type: number | undefined;
    values: string[] | undefined;
    lastUpdated?: Date;
}

const DEVICE_NAMES: { [key: number]: string } = {
    1: 'Wedo 2.0 Medium Motor',
    2: 'Powered Up Train Motor',
    8: 'Powered Up Light',
    34: 'Wedo 2.0 Tilt Sensor',
    35: 'Wedo 2.0 Infrared Motion Sensor',
    37: 'BOOST Color Distance Sensor',
    38: 'BOOST Interactive Motor',
    46: 'Technic Large Motor',
    47: 'Technic Extra Large Motor',
    48: 'SPIKE Medium Angular Motor',
    49: 'SPIKE Large Angular Motor',
    61: 'SPIKE Color Sensor',
    62: 'SPIKE Ultrasonic Sensor',
    63: 'SPIKE Force Sensor',
    64: 'SPIKE 3x3 Color Light Matrix',
    65: 'SPIKE Small Angular Motor',
    75: 'Technic Medium Angular Motor',
    76: 'Technic Large Angular Motor',
};

interface PortComponentProps {
    port: string;
    side: 'left' | 'right';
    data: Map<string, PortData> | undefined;
}

const PortComponent: React.FunctionComponent<PortComponentProps> = ({
    port,
    side,
    data,
}) => {
    const portId = 'Port.' + port;
    const data1 = data?.get(portId);

    try {
        // get name based on puptype
        const name = DEVICE_NAMES[data1?.type || 0] || '';

        // get Icon component based on puptype
        let iconComponent;
        switch (data1?.type) {
            // Any motor with rotation sensors.
            // 34, 35, 37,
            case 38:
            case 46:
            case 47:
            case 48:
            case 49:
            case 65:
            case 75:
            case 76:
                iconComponent = (
                    <MotorIcon data={data1} name={name} side={side}></MotorIcon>
                );
                break;
            case 61:
                // SPIKE Prime / MINDSTORMS Robot Inventor Color Sensor
                iconComponent = (
                    <ColorSensorIconComponent
                        data={data1}
                        name={name}
                    ></ColorSensorIconComponent>
                );
                break;
            case 62:
                // SPIKE Prime / MINDSTORMS Robot Inventor Ultrasonic Sensor
                iconComponent = (
                    <UltrasonicSensorIcon
                        data={data1}
                        name={name}
                    ></UltrasonicSensorIcon>
                );
                break;
            case 63:
                // SPIKE Prime Force Sensor
                iconComponent = (
                    <ForceSensorIcon data={data1} name={name}></ForceSensorIcon>
                );
                break;
            default:
                iconComponent = <DeviceIcon data={data1} name={name}></DeviceIcon>;
                break;
        }

        const portLabelComponent = <div className="port-label">{port}</div>;
        return (
            <>
                {side === 'right' ? portLabelComponent : <></>}

                <div className="pb-device">
                    {/* <div className="port-name">{name}</div> */}
                    <div className="port-icon" title={name}>
                        {iconComponent}
                    </div>
                    <div className="port-value">{data1?.values?.join(', ')}</div>
                </div>

                {side === 'left' ? portLabelComponent : <></>}
            </>
        );
    } catch (e) {
        return <></>;
    }
};

export default PortComponent;
