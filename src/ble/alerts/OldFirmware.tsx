// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './index.scss';
import { Button, Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { I18nId, useI18n } from './i18n';

type OldFirmwareProps = {
    onFlashFirmware: () => void;
};

const OldFirmware: React.VoidFunctionComponent<OldFirmwareProps> = ({
    onFlashFirmware,
}) => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate(I18nId.OldFirmwareMessage)}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon="download" onClick={onFlashFirmware}>
                    {i18n.translate(I18nId.OldFirmwareFlashFirmwareLabel)}
                </Button>
            </div>
        </>
    );
};

export const oldFirmware: CreateToast<never, 'dismiss' | 'flashFirmware'> = (
    onAction,
) => {
    return {
        message: <OldFirmware onFlashFirmware={() => onAction('flashFirmware')} />,
        icon: 'info-sign',
        intent: Intent.PRIMARY,
        onDismiss: () => onAction('dismiss'),
    };
};
