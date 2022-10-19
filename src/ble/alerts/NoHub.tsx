// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './index.scss';
import { AnchorButton, Button, Intent } from '@blueprintjs/core';
import React from 'react';
import { appName, pybricksBluetoothTroubleshootingUrl } from '../../app/constants';
import type { CreateToast } from '../../toasterTypes';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { useI18n } from './i18n';

type NoHubProps = {
    onFlashFirmware: () => void;
};

const NoHub: React.VoidFunctionComponent<NoHubProps> = ({ onFlashFirmware }) => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate('noHub.message')}</p>
            <p>
                {i18n.translate('noHub.suggestion1', {
                    appName,
                    buttonName: (
                        <strong>{i18n.translate('noHub.flashFirmwareButton')}</strong>
                    ),
                })}
            </p>
            <p>{i18n.translate('noHub.suggestion2')}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon="download" onClick={onFlashFirmware}>
                    {i18n.translate('noHub.flashFirmwareButton')}
                </Button>
                <AnchorButton
                    icon="help"
                    href={pybricksBluetoothTroubleshootingUrl}
                    target="_blank"
                >
                    {i18n.translate('noHub.troubleshootButton')}
                    <ExternalLinkIcon />
                </AnchorButton>
            </div>
        </>
    );
};

export const noHub: CreateToast<never, 'dismiss' | 'flashFirmware'> = (onAction) => {
    return {
        message: <NoHub onFlashFirmware={() => onAction('flashFirmware')} />,
        icon: 'info-sign',
        intent: Intent.PRIMARY,
        timeout: 15000,
        onDismiss: () => onAction('dismiss'),
    };
};
