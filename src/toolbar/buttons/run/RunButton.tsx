// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type RunButtonProps = Pick<ActionButtonProps, 'id'>;

const RunButton: React.VoidFunctionComponent<RunButtonProps> = ({ id }) => {
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const mpyAbiVersion = useSelector((s) => s.hub.mpyAbiVersion);
    const runtime = useSelector((s) => s.hub.runtime);
    const activeFile = useSelector((s) => s.editor.activeFileUuid);
    const keyboardShortcut = 'F5';

    const i18n = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            keyboardShortcut={keyboardShortcut}
            tooltip={
                downloadProgress
                    ? i18n.translate('tooltip.progress', {
                          percent: i18n.formatPercentage(downloadProgress),
                      })
                    : i18n.translate('tooltip.action', { key: keyboardShortcut })
            }
            icon={icon}
            enabled={activeFile !== null && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() => dispatch(downloadAndRun(mpyAbiVersion))}
        />
    );
};

export default RunButton;
