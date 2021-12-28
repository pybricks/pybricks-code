// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { useDispatch } from '../actions';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { stop } from './actions';
import { HubRuntimeState } from './reducers';
import stopIcon from './stop.svg';

type StopButtonProps = Pick<ActionButtonProps, 'id'> &
    Pick<ActionButtonProps, 'keyboardShortcut'>;

const StopButton: React.FunctionComponent<StopButtonProps> = (props) => {
    const runtime = useSelector((s) => s.hub.runtime);

    const dispatch = useDispatch();

    return (
        <ActionButton
            tooltip={TooltipId.Stop}
            icon={stopIcon}
            enabled={runtime === HubRuntimeState.Running}
            onAction={() => dispatch(stop())}
            {...props}
        />
    );
};

export default StopButton;
