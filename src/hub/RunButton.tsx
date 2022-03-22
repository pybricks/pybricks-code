// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { I18nId } from '../toolbar/i18n';
import { downloadAndRun } from './actions';
import { HubRuntimeState } from './reducers';
import runIcon from './run.svg';

type RunButtonProps = Pick<ActionButtonProps, 'label' | 'keyboardShortcut'>;

const RunButton: React.VoidFunctionComponent<RunButtonProps> = ({
    label,
    keyboardShortcut,
}) => {
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const runtime = useSelector((s) => s.hub.runtime);
    const hasEditor = useSelector((s) => s.app.hasEditor);

    const dispatch = useDispatch();

    return (
        <ActionButton
            label={label}
            keyboardShortcut={keyboardShortcut}
            tooltip={I18nId.Run}
            progressTooltip={I18nId.RunProgress}
            icon={runIcon}
            enabled={hasEditor && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() => dispatch(downloadAndRun())}
        />
    );
};

export default RunButton;
