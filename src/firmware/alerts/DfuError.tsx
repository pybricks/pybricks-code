// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type DfuErrorProps = {
    onTryAgain: () => void;
};

const DfuError: React.VoidFunctionComponent<DfuErrorProps> = ({ onTryAgain }) => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('dfuError.message')}</p>
            <p>{i18n.translate('dfuError.suggestion')}</p>
            <Button onClick={onTryAgain}>
                {i18n.translate('dfuError.tryAgainButton')}
            </Button>
        </>
    );
};

export const dfuError: CreateToast<never, 'dismiss' | 'tryAgain'> = (onAction) => {
    return {
        message: <DfuError onTryAgain={() => onAction('tryAgain')} />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
