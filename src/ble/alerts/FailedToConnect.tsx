// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const FailedToConnect: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('failedToConnect.message')}</p>
            <p>{i18n.translate('failedToConnect.suggestion')}</p>
        </>
    );
};

export const failedToConnect: CreateToast = (onAction) => ({
    message: <FailedToConnect />,
    icon: 'error',
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
