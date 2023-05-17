// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Icon, Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoFilesToBackup: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            {i18n.translate('noFilesToBackup.message', {
                icon: <Icon icon="plus" />,
            })}
        </>
    );
};

export const noFilesToBackup: CreateToast = (onAction) => ({
    message: <NoFilesToBackup />,
    icon: 'info-sign',
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
