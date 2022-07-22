// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { useI18n } from './i18n';

const FirmwareMismatch: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('firmwareMismatch.message')}</p>;
};

export const firmwareMismatch: CreateToast = (onAction) => {
    return {
        message: <FirmwareMismatch />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
