// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Icon, Intent } from '@blueprintjs/core';
import { InfoSign, Plus } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoFilesToBackup: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            {i18n.translate('noFilesToBackup.message', {
                icon: <Icon icon={<Plus />} />,
            })}
        </>
    );
};

export const noFilesToBackup: CreateToast = (onAction) => ({
    message: <NoFilesToBackup />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
