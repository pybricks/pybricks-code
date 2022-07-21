// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnchorButton, Intent } from '@blueprintjs/core';
import React from 'react';
import { pybricksUsbDfuTroubleshootingUrl } from '../../app/constants';
import { CreateToast } from '../../i18nToaster';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { isLinux, isWindows } from '../../utils/os';
import { I18nId, useI18n } from './i18n';

const NoDfuHub: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate(I18nId.NoDfuHubMessage)}</p>

            {isWindows() && <p>{i18n.translate(I18nId.NoDfuHubSuggestion1Windows)}</p>}
            {isLinux() && <p>{i18n.translate(I18nId.NoDfuHubSuggestion1Linux)}</p>}

            <p>{i18n.translate(I18nId.NoDfuHubSuggestion2)}</p>

            <AnchorButton
                icon="help"
                href={pybricksUsbDfuTroubleshootingUrl}
                target="_blank"
            >
                {i18n.translate(I18nId.NoDfuHubTroubleshootButton)}
                <ExternalLinkIcon />
            </AnchorButton>
        </>
    );
};

export const noDfuHub: CreateToast = (onAction) => {
    return {
        message: <NoDfuHub />,
        icon: 'info-sign',
        intent: Intent.PRIMARY,
        onDismiss: () => onAction('dismiss'),
    };
};
