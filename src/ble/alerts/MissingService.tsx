// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type MissingServiceProps = {
    serviceName: string;
    hubName: string;
};

const MissingService: React.FunctionComponent<MissingServiceProps> = ({
    serviceName,
    hubName,
}) => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('missingService.message', { serviceName })}</p>
            <p>{i18n.translate('missingService.suggestion1')}</p>
            <p>{i18n.translate('missingService.suggestion2', { hubName })}</p>
        </>
    );
};

export const missingService: CreateToast<MissingServiceProps> = (onAction, props) => ({
    message: <MissingService {...props} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
