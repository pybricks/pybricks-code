// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { downloadAndRun } from './actions';
import { HubRuntimeState } from './reducers';
import runIcon from './run.svg';

type RunButtonProps = Pick<ActionButtonProps, 'id' | 'keyboardShortcut'>;

const RunButton: React.VoidFunctionComponent<RunButtonProps> = ({
    id,
    keyboardShortcut,
}) => {
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const runtime = useSelector((s) => s.hub.runtime);
    const hasEditor = useSelector((s) => s.app.hasEditor);

    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            keyboardShortcut={keyboardShortcut}
            tooltip={TooltipId.Run}
            progressTooltip={TooltipId.RunProgress}
            icon={runIcon}
            enabled={hasEditor && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() => dispatch(downloadAndRun())}
        />
    );
};

export default RunButton;
