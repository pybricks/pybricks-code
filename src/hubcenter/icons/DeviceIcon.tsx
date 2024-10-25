// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import * as React from 'react';
import { DeviceRegistryEntry, PortData } from '../PortComponent';

export interface DeviceIconProps {
    devEntry: DeviceRegistryEntry | undefined;
    portData: PortData | undefined;
}
const DeviceIcon: React.FunctionComponent<DeviceIconProps> = ({ devEntry }) => {
    return (
        <div className="pb-device-icon">
            {devEntry?.icon ? (
                <img src={devEntry?.icon} alt={devEntry?.name} className="icon" />
            ) : (
                <>
                    <div>{devEntry?.name}</div>
                    <br />
                </>
            )}
        </div>
    );
};
export default DeviceIcon;
