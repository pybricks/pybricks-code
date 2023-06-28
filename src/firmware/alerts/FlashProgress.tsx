// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent, ProgressBar } from '@blueprintjs/core';
import { Download } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type FlashProgressProps = {
    action: 'erase' | 'flash';
    progress: number | undefined;
};

const FlashProgress: React.FunctionComponent<FlashProgressProps> = ({
    action,
    progress,
}) => {
    const i18n = useI18n();

    return (
        <>
            {action === 'erase' && (
                <p>
                    {i18n.translate('flashProgress.erasing', {
                        percent: progress ? i18n.formatPercentage(progress) : '',
                    })}
                </p>
            )}

            {action === 'flash' && (
                <p>
                    {i18n.translate('flashProgress.flashing', {
                        percent: progress ? i18n.formatPercentage(progress) : '',
                    })}
                </p>
            )}

            <ProgressBar value={progress} />
        </>
    );
};

export const flashProgress: CreateToast<FlashProgressProps> = (onAction, props) => ({
    message: <FlashProgress {...props} />,
    icon: <Download />,
    intent: Intent.PRIMARY,
    // close one second after progress is complete
    timeout: (props.progress ?? 0) < 1 ? 0 : 1000,
    onDismiss: () => onAction('dismiss'),
});
