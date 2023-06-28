// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

const BluetoothNotAvailable: React.FunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('bluetoothNotAvailable.message')}</p>
            <p>{i18n.translate('bluetoothNotAvailable.suggestion')}</p>
            <p>{i18n.translate('bluetoothNotAvailable.browserSupport')}</p>
        </>
    );
};

export const bluetoothNotAvailable: CreateToast = (onAction) => ({
    message: <BluetoothNotAvailable />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
