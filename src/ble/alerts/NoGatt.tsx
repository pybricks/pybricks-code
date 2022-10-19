// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoGatt: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('noGatt.message')}</p>;
};

export const noGatt: CreateToast = (onAction) => {
    return {
        message: <NoGatt />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
