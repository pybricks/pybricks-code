// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { isIOS, isLinux } from '../../utils/os';
import { useI18n } from './i18n';

const NoWebBluetooth: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    return (
        <>
            <p>{i18n.translate('noWebBluetooth.message')}</p>
            {!isLinux() && !isIOS() && (
                <p>{i18n.translate('noWebBluetooth.suggestion')}</p>
            )}
            {isLinux() && (
                <>
                    <p>{i18n.translate('noWebBluetooth.linux')}</p>
                    <p>
                        <code>
                            chrome://flags/#enable-experimental-web-platform-features
                        </code>
                        <Button
                            icon="duplicate"
                            small={true}
                            minimal={true}
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    'chrome://flags/#enable-experimental-web-platform-features',
                                )
                            }
                        />
                    </p>
                </>
            )}
        </>
    );
};

export const noWebBluetooth: CreateToast = (onAction) => {
    return {
        message: <NoWebBluetooth />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
