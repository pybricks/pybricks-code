// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import React from 'react';
import ColorSensorIconComponent from './icons/ColorSensorIcon';
import DeviceIcon from './icons/DeviceIcon';
import MotorIcon from './icons/MotorIcon';
import boostColorDistanceSensor from './icons/boost_color_distance_sensor_37.png';
// import wedoMediumMotor from './icons/wedo_2_0_medium_motor_1.png';
// import poweredUpTrainMotor from './icons/powered_up_train_motor_2.png';
// import poweredUpLight from './icons/8_powered_up_light.png';
import boostInteractiveMotor from './icons/boost_interactive_motor_38.png';
import boostInteractiveMotorShaft from './icons/boost_interactive_motor_38_shaft.png';
import spikeColorSensor from './icons/spike_color_sensor_61.png';
import spikeForceSensor from './icons/spike_force_sensor_63.png';
// import spikeColorLightMatrix from './icons/spike_3x3_color_light_matrix_64.png';
import spikeLargeAngularMotor from './icons/spike_large_angular_motor_49.png';
import spikeLargeAngularMotorShaft from './icons/spike_large_angular_motor_49_shaft.png';
import spikeMediumAngularMotor from './icons/spike_medium_angular_motor_48.png';
import spikeMediumAngularMotorShaft from './icons/spike_medium_angular_motor_48_shaft.png';
import spikeSmallAngularMotor from './icons/spike_small_angular_motor_65.png';
import spikeUltrasonicSensor from './icons/spike_ultrasonic_sensor_62.png';
import technicLargeAngularMotor from './icons/technic_large_angular_motor_76.png';
import technicLargeAngularMotorShaft from './icons/technic_large_angular_motor_76_shaft.png';
import technicMediumAngularMotor from './icons/technic_medium_angular_motor_75.png';
import technicMediumAngularMotorShaft from './icons/technic_medium_angular_motor_75_shaft.png';
import wedoInfraredMotionSensor from './icons/wedo_2_0_infrared_motion_sensor_35.png';
import wedoTiltSensor from './icons/wedo_2_0_tilt_sensor_34.png';
// import technicLargeMotor from './icons/technic_large_motor_46.png';
// import technicExtraLargeMotor from './icons/technic_extra_large_motor_47.png';

interface PortComponentProps {
    port: string;
    side: 'left' | 'right';
    data: Map<string, PortData> | undefined;
}

export interface PortData {
    type: number | undefined;
    lastUpdated?: Date;
    dataMap: Map<string, string> | undefined;
    dataStr: string;
}

export interface DeviceRegistryEntry {
    name: string;
    icon?: string;
    iconShaft?: string;
    classShaft?: string;
    canRotate?: boolean;
}

const PortComponent: React.FunctionComponent<PortComponentProps> = ({
    port,
    side,
    data,
}) => {
    const DeviceRegistry = new Map<number, DeviceRegistryEntry>([
        [1, { name: 'Wedo 2.0 Medium Motor' }], //, wedoMediumMotor],
        [2, { name: 'Powered Up Train Motor' }], //, poweredUpTrainMotor],
        [8, { name: 'Powered Up Light' }], //, poweredUpLight],
        [34, { name: 'Wedo 2.0 Tilt Sensor', icon: wedoTiltSensor }],
        [
            35,
            { name: 'Wedo 2.0 Infrared Motion Sensor', icon: wedoInfraredMotionSensor },
        ],
        [37, { name: 'BOOST Color Distance Sensor', icon: boostColorDistanceSensor }],
        [
            38,
            {
                name: 'BOOST Interactive Motor',
                icon: boostInteractiveMotor,
                iconShaft: boostInteractiveMotorShaft,
                classShaft: 'motor-shaft-centered',
                canRotate: false,
            },
        ],
        [46, { name: 'Technic Large Motor' }], //, technicLargeMotor],
        [47, { name: 'Technic Extra Large Motor' }], //, technicExtraLargeMotor],
        [
            48,
            {
                name: 'SPIKE Medium Angular Motor',
                icon: spikeMediumAngularMotor,
                iconShaft: spikeMediumAngularMotorShaft,
                classShaft: 'motor-shaft-start',
                canRotate: true,
            },
        ],
        [
            49,
            {
                name: 'SPIKE Large Angular Motor',
                icon: spikeLargeAngularMotor,
                iconShaft: spikeLargeAngularMotorShaft,
                classShaft: 'motor-shaft-start',
                canRotate: true,
            },
        ],
        [61, { name: 'SPIKE Color Sensor', icon: spikeColorSensor }],
        [62, { name: 'SPIKE Ultrasonic Sensor', icon: spikeUltrasonicSensor }],
        [63, { name: 'SPIKE Force Sensor', icon: spikeForceSensor }],
        [64, { name: 'SPIKE 3x3 Color Light Matrix' }], //, spikeColorLightMatrix],
        [
            65,
            {
                name: 'SPIKE Small Angular Motor',
                icon: spikeSmallAngularMotor,
                classShaft: 'motor-shaft-start',
                canRotate: true,
            },
        ],
        [
            75,
            {
                name: 'Technic Medium Angular Motor',
                icon: technicMediumAngularMotor,
                iconShaft: technicMediumAngularMotorShaft,
                classShaft: 'motor-shaft-start',
                canRotate: true,
            },
        ],
        [
            76,
            {
                name: 'Technic Large Angular Motor',
                icon: technicLargeAngularMotor,
                iconShaft: technicLargeAngularMotorShaft,
                classShaft: 'motor-shaft-start',
                canRotate: true,
            },
        ],
    ]);

    const portId = 'Port.' + port;
    const portData = data?.get(portId);

    // get name based on puptype
    const devEntry = DeviceRegistry.get(portData?.type ?? 0);

    // get Icon component based on puptype
    let iconComponent = (
        <DeviceIcon portData={portData} devEntry={devEntry}></DeviceIcon>
    );

    if (devEntry?.iconShaft !== undefined) {
        iconComponent = (
            <MotorIcon portData={portData} devEntry={devEntry} side={side}></MotorIcon>
        );
    } else if (portData?.type === 61 || portData?.type === 37) {
        iconComponent = (
            <ColorSensorIconComponent
                portData={portData}
                devEntry={devEntry}
            ></ColorSensorIconComponent>
        );
    }

    const portLabelComponent = <div className="port-label">{port}</div>;
    const portDataStr = portData?.dataStr || '';
    return (
        <>
            {side === 'right' ? portLabelComponent : <></>}

            <div className="pb-device">
                <div className="port-icon" title={devEntry?.name}>
                    {iconComponent}
                </div>
                <div className="port-value">{portDataStr}</div>
            </div>

            {side === 'left' ? portLabelComponent : <></>}
        </>
    );
};

export default PortComponent;
