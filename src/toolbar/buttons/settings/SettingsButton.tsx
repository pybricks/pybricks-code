// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

type SettingsButtonProps = Pick<ActionButtonProps, 'onAction'>;

const SettingsButton: React.VoidFunctionComponent<SettingsButtonProps> = ({
    onAction,
}) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return (
        <ActionButton
            label={i18n.translate(I18nId.Label)}
            tooltip={i18n.translate(I18nId.Tooltip)}
            icon={icon}
            onAction={onAction}
        />
    );
};

export default SettingsButton;
