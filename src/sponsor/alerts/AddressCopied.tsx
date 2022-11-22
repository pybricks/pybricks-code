// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const AddressCopied: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('addressCopied.message')}</p>;
};

export const addressCopied: CreateToast = (onAction) => {
    return {
        message: <AddressCopied />,
        icon: 'info-sign',
        intent: Intent.PRIMARY,
        timeout: 5000,
        onDismiss: () => onAction('dismiss'),
    };
};
