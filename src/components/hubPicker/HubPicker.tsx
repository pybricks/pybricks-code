// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './hubPicker.scss';
import { Radio, RadioGroup } from '@blueprintjs/core';
import React from 'react';
import { useHubPickerSelectedHub } from './hooks';
import { Hub } from '.';

type HubIconProps = {
    url: URL;
    label: string;
};

const HubIcon: React.FunctionComponent<HubIconProps> = ({ url, label }) => {
    return <img src={url.toString()} width={64} height={64} title={label} />;
};

type HubPickerProps = {
    disabled?: boolean;
};

export const HubPicker: React.FunctionComponent<HubPickerProps> = ({ disabled }) => {
    const [selectedHub, setSelectedHub] = useHubPickerSelectedHub();

    return (
        <RadioGroup
            className="pb-hub-picker"
            selectedValue={selectedHub}
            disabled={disabled}
            onChange={(e) => setSelectedHub(e.currentTarget.value as Hub)}
        >
            <Radio value={Hub.Move}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-move.png', import.meta.url)}
                    label="BOOST Move Hub"
                />
            </Radio>
            <Radio value={Hub.City}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-city.png', import.meta.url)}
                    label="City Hub"
                />
            </Radio>
            <Radio value={Hub.Technic}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-technic.png', import.meta.url)}
                    label="Technic Hub"
                />
            </Radio>
            <Radio value={Hub.Prime}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-prime.png', import.meta.url)}
                    label="SPIKE Prime Hub"
                />
            </Radio>
            <Radio value={Hub.Essential}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-essential.png', import.meta.url)}
                    label="SPIKE Essential Hub"
                />
            </Radio>
            <Radio value={Hub.Inventor}>
                <HubIcon
                    url={new URL('@pybricks/images/hub-inventor.png', import.meta.url)}
                    label="MINDSTORMS Robot Inventor Hub"
                />
            </Radio>
        </RadioGroup>
    );
};
