// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './index.scss';
import { AnchorButton, Button, Intent } from '@blueprintjs/core';
import { Download, Help, InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { pybricksBluetoothTroubleshootingUrl } from '../../app/constants';
import ExternalLinkIcon from '../../components/ExternalLinkIcon';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type NoHubProps = {
    onFlashFirmware: () => void;
};

const NoHub: React.FunctionComponent<NoHubProps> = ({ onFlashFirmware }) => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate('noHub.message')}</p>
            <p>{i18n.translate('noHub.suggestion')}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon={<Download />} onClick={onFlashFirmware}>
                    {i18n.translate('noHub.flashFirmwareButton')}
                </Button>
                <AnchorButton
                    icon={<Help />}
                    href={pybricksBluetoothTroubleshootingUrl}
                    target="_blank"
                    rel="noopener"
                >
                    {i18n.translate('noHub.troubleshootButton')}
                    <ExternalLinkIcon />
                </AnchorButton>
            </div>
        </>
    );
};

export const noHub: CreateToast<never, 'dismiss' | 'flashFirmware'> = (onAction) => ({
    message: <NoHub onFlashFirmware={() => onAction('flashFirmware')} />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    timeout: 15000,
    onDismiss: () => onAction('dismiss'),
});
