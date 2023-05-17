// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { pythonFileExtension } from '../../pybricksMicropython/lib';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const NoPyFiles: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            {i18n.translate('noPyFiles.message', {
                py: <code>{pythonFileExtension}</code>,
                zip: 'ZIP',
            })}
        </>
    );
};

export const noPyFiles: CreateToast = (onAction) => ({
    message: <NoPyFiles />,
    icon: 'info-sign',
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
