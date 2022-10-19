// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoDfuInterface: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return <p>{i18n.translate('noDfuInterface.message')}</p>;
};

export const noDfuInterface: CreateToast = (onAction) => {
    return {
        message: <NoDfuInterface />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
