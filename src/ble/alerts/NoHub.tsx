// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './index.scss';
import { AnchorButton, Button, Intent } from '@blueprintjs/core';
import React from 'react';
import { appName, pybricksBluetoothTroubleshootingUrl } from '../../app/constants';
import { CreateToast } from '../../i18nToaster';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { I18nId, useI18n } from './i18n';

type NoHubProps = {
    onFlashFirmware: () => void;
};

const NoHub: React.VoidFunctionComponent<NoHubProps> = ({ onFlashFirmware }) => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate(I18nId.NoHubMessage)}</p>
            <p>
                {i18n.translate(I18nId.NoHubSuggestion1, {
                    appName,
                    buttonName: (
                        <strong>
                            {i18n.translate(I18nId.NoHubFlashFirmwareButton)}
                        </strong>
                    ),
                })}
            </p>
            <p>{i18n.translate(I18nId.NoHubSuggestion2)}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon="download" onClick={onFlashFirmware}>
                    {i18n.translate(I18nId.NoHubFlashFirmwareButton)}
                </Button>
                <AnchorButton
                    icon="help"
                    href={pybricksBluetoothTroubleshootingUrl}
                    target="_blank"
                >
                    {i18n.translate(I18nId.NoHubTroubleshootButton)}
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
