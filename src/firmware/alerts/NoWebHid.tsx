// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoWebHid: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('noWebHid.message')}</p>
            <p>{i18n.translate('noWebHid.suggestion')}</p>
        </>
    );
};

export const noWebHid: CreateToast = (onAction) => ({
    message: <NoWebHid />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
