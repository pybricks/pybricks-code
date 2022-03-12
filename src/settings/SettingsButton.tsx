// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import React from 'react';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import settingsIcon from './settings.svg';

type SettingsButtonProps = Pick<ActionButtonProps, 'id' | 'onAction'>;

const SettingsButton: React.VoidFunctionComponent<SettingsButtonProps> = ({
    id,
    onAction,
}) => {
    return (
        <ActionButton
            id={id}
            tooltip={TooltipId.Settings}
            icon={settingsIcon}
            onAction={onAction}
        />
    );
};

export default SettingsButton;
