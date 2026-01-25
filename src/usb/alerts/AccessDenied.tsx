// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { isLinux } from '../../utils/os';
import { useI18n } from './i18n';

const AccessDenied: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('accessDenied.message')}</p>
            {isLinux() && <p>{i18n.translate('accessDenied.linuxSuggestion')}</p>}
        </>
    );
};

export const accessDenied: CreateToast = (onAction) => ({
    message: <AccessDenied />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
