// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const ReleaseButton: React.FunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('releaseButton.message')}</p>;
};

export const releaseButton: CreateToast = (onAction) => ({
    message: <ReleaseButton />,
    icon: 'info-sign',
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
