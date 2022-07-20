// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Radio, RadioGroup } from '@blueprintjs/core';
import React from 'react';
import { Hub } from '.';

type HubPickerProps = {
    hubType: Hub;
    onChange: (hubType: Hub) => void;
};

export const HubPicker: React.VoidFunctionComponent<HubPickerProps> = ({
    hubType,
    onChange,
}) => {
    return (
        <RadioGroup
            selectedValue={hubType}
            onChange={(e) => onChange(e.currentTarget.value as Hub)}
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
