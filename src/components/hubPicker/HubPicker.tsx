// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Radio, RadioGroup } from '@blueprintjs/core';
import React from 'react';
import { useHubPickerSelectedHub } from './hooks';
import { Hub } from '.';

export const HubPicker: React.VoidFunctionComponent = () => {
    const [selectedHub, setSelectedHub] = useHubPickerSelectedHub();

    return (
        <RadioGroup
            selectedValue={selectedHub}
            onChange={(e) => setSelectedHub(e.currentTarget.value as Hub)}
        >
            <Radio value={Hub.Move}>BOOST Move Hub</Radio>
            <Radio value={Hub.City}>City Hub</Radio>
            <Radio value={Hub.Technic}>Technic Hub</Radio>
            <Radio value={Hub.Prime}>SPIKE Prime Hub</Radio>
            <Radio value={Hub.Essential}>SPIKE Essential Hub</Radio>
            <Radio value={Hub.Inventor}>MINDSTORMS Robot Inventor Hub</Radio>
        </RadioGroup>
    );
};
