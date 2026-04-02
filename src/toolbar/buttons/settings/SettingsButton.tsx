// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Pybricks Authors

import React from 'react';
import { Activity, useActivitiesSelectedActivity } from '../../../activities/hooks';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type SettingsButtonProps = Pick<ActionButtonProps, 'id'>;

const SettingsButton: React.FunctionComponent<SettingsButtonProps> = ({ id }) => {
    const i18n = useI18n();
    const [selectedActivity, setSelectedActivity] = useActivitiesSelectedActivity();

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            tooltip={i18n.translate(
                selectedActivity === Activity.Settings
                    ? 'tooltip.hide'
                    : 'tooltip.show',
            )}
            icon={icon}
            onAction={() =>
                setSelectedActivity(
                    selectedActivity === Activity.Settings
                        ? Activity.None
                        : Activity.Settings,
                )
            }
        />
    );
};

export default SettingsButton;
