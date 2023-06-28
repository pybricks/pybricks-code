// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { InfoSign } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const AddressCopied: React.FunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('addressCopied.message')}</p>;
};

export const addressCopied: CreateToast = (onAction) => {
    return {
        message: <AddressCopied />,
        icon: <InfoSign />,
        intent: Intent.PRIMARY,
        timeout: 5000,
        onDismiss: () => onAction('dismiss'),
    };
};
