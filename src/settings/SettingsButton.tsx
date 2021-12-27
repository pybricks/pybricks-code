// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import React from 'react';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import settingsIcon from './settings.svg';

type SettingsButtonProps = Pick<ActionButtonProps, 'id' | 'onAction'>;

const SettingsButton: React.FunctionComponent<SettingsButtonProps> = (props) => {
    return <ActionButton tooltip={TooltipId.Settings} icon={settingsIcon} {...props} />;
};

export default SettingsButton;
