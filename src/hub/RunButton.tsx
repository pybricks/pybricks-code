// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { downloadAndRun } from './actions';
import { HubRuntimeState } from './reducers';
import runIcon from './run.svg';

type RunButtonProps = Pick<ActionButtonProps, 'id'> &
    Pick<ActionButtonProps, 'keyboardShortcut'>;

const RunButton: React.FunctionComponent<RunButtonProps> = (props) => {
    const editor = useSelector((s) => s.editor.current);
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const runtime = useSelector((s) => s.hub.runtime);

    const dispatch = useDispatch();

    return (
        <ActionButton
            tooltip={TooltipId.Run}
            progressTooltip={TooltipId.RunProgress}
            icon={runIcon}
            enabled={editor !== null && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() => dispatch(downloadAndRun())}
            {...props}
        />
    );
};

export default RunButton;
