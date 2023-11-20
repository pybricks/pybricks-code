// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './programTypePicker.scss';
import { Radio, RadioGroup } from '@blueprintjs/core';
import React from 'react';
import blockIcon from './blocks.png';
import { useProgramTypePickerSelectedProgramType } from './hooks';
import pythonIcon from './python.png';
import { ProgramType } from '.';

type ProgramTypeIconProps = {
    icon: string;
    label: string;
};

const ProgramTypeIcon: React.FunctionComponent<ProgramTypeIconProps> = ({
    icon,
    label,
}) => {
    return <img src={icon} width={150 * 1.2} height={150} title={label} />;
};

export const ProgramTypePicker: React.FunctionComponent = () => {
    const [selectedProgramType, setSelectedProgramType] =
        useProgramTypePickerSelectedProgramType();

    return (
        <RadioGroup
            className="pb-program-type-picker"
            selectedValue={selectedProgramType}
            onChange={(e) =>
                setSelectedProgramType(e.currentTarget.value as ProgramType)
            }
        >
            <Radio value={ProgramType.Blocks}>
                <ProgramTypeIcon icon={blockIcon} label="Code with blocks" />
            </Radio>
            <Radio value={ProgramType.Python}>
                <ProgramTypeIcon icon={pythonIcon} label="Code with Python" />
            </Radio>
        </RadioGroup>
    );
};
