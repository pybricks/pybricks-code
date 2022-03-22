// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton from '../../ActionButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

const RunButton: React.VFC = () => {
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const runtime = useSelector((s) => s.hub.runtime);
    const hasEditor = useSelector((s) => s.app.hasEditor);
    const keyboardShortcut = 'F5';

    const dispatch = useDispatch();
    const [i18n] = useI18n();

    return (
        <ActionButton
            label={i18n.translate(I18nId.Label)}
            keyboardShortcut={keyboardShortcut}
            tooltip={
                downloadProgress
                    ? i18n.translate(I18nId.TooltipProgress, {
                          percent: i18n.formatPercentage(downloadProgress),
                      })
                    : i18n.translate(I18nId.TooltipAction, { key: keyboardShortcut })
            }
            icon={icon}
            enabled={hasEditor && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() => dispatch(downloadAndRun())}
        />
    );
};

export default RunButton;
