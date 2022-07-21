// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { I18nId, useI18n } from './i18n';

const NoWebUsb: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate(I18nId.NoWebUsbMessage)}</p>
            <p>{i18n.translate(I18nId.NoWebUsbSuggestion)}</p>
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
