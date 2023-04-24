// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { appName } from '../../app/constants';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type NewPybricksProfileProps = {
    /** The Pybricks Profile version reported by the hub. */
    hubVersion: string;
    /** The supported Pybricks Profile version. */
    supportedVersion: string;
};

const NewPybricksProfile: React.VoidFunctionComponent<NewPybricksProfileProps> = ({
    hubVersion,
    supportedVersion,
}) => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('newPybricksProfile.message')}</p>
            <p>
                {i18n.translate('newPybricksProfile.versions', {
                    hubVersion: `v${hubVersion}`,
                    app: appName,
                    appVersion: `v${supportedVersion}`,
                })}
            </p>
            <p>
                {i18n.translate('newPybricksProfile.suggestion', {
                    app: appName,
                })}
            </p>
        </>
    );
};

export const newPybricksProfile: CreateToast<NewPybricksProfileProps> = (
    onAction,
    props,
) => ({
    message: <NewPybricksProfile {...props} />,
    icon: 'warning-sign',
    intent: Intent.WARNING,
    timeout: 15000, // long message, need more time to read
    onDismiss: () => onAction('dismiss'),
});
