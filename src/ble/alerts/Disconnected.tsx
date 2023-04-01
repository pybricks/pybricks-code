// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const Disconnected: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('disconnected.message')}</p>;
};

export const disconnected: CreateToast = (onAction) => ({
    message: <Disconnected />,
    icon: 'error',
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
