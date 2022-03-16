// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import React from 'react';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import settingsIcon from './settings.svg';

type SettingsButtonProps = Pick<ActionButtonProps, 'label' | 'onAction'>;

const SettingsButton: React.VoidFunctionComponent<SettingsButtonProps> = ({
    label,
    onAction,
}) => {
    return (
        <ActionButton
            label={label}
            tooltip={TooltipId.Settings}
            icon={settingsIcon}
            onAction={onAction}
        />
    );
};

export default SettingsButton;
