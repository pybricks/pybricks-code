// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Icon, Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { I18nId, useI18n } from './i18n';

const NoFilesToBackup: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            {i18n.translate(I18nId.NoFilesToBackupMessage, {
                icon: <Icon icon="plus" />,
            })}
        </>
    );
};

export const noFilesToBackup: CreateToast = (onAction) => {
    return {
        message: <NoFilesToBackup />,
        icon: 'info-sign',
        intent: Intent.PRIMARY,
        onDismiss: () => onAction('dismiss'),
    };
};
