// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './index.scss';
import { Button, Intent } from '@blueprintjs/core';
import { Download, InfoSign } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type OldFirmwareProps = {
    onFlashFirmware: () => void;
};

const OldFirmware: React.FunctionComponent<OldFirmwareProps> = ({
    onFlashFirmware,
}) => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate('oldFirmware.message')}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon={<Download />} onClick={onFlashFirmware}>
                    {i18n.translate('oldFirmware.flashFirmware.label')}
                </Button>
            </div>
        </>
    );
};

export const oldFirmware: CreateToast<never, 'dismiss' | 'flashFirmware'> = (
    onAction,
) => ({
    message: <OldFirmware onFlashFirmware={() => onAction('flashFirmware')} />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
