// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { isIOS } from '../../utils/os';
import { useI18n } from './i18n';

const NoWebUsb: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('noWebUsb.message')}</p>
            {!isIOS() && <p>{i18n.translate('noWebUsb.suggestion')}</p>}
        </>
    );
};

export const noWebUsb: CreateToast = (onAction) => ({
    message: <NoWebUsb />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
