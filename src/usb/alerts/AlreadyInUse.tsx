// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const AlreadyInUse: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('alreadyInUse.message')}</p>
        </>
    );
};

export const alreadyInUse: CreateToast = (onAction) => ({
    message: <AlreadyInUse />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
