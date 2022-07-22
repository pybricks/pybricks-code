// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { useI18n } from './i18n';

const NoWebUsb: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('noWebUsb.message')}</p>
            <p>{i18n.translate('noWebUsb.suggestion')}</p>
        </>
    );
};

export const noWebUsb: CreateToast = (onAction) => {
    return {
        message: <NoWebUsb />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
