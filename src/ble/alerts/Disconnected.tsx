// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const Disconnected: React.FunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('disconnected.message')}</p>;
};

export const disconnected: CreateToast = (onAction) => ({
    message: <Disconnected />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
