// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { stop } from './actions';
import { HubRuntimeState } from './reducers';
import stopIcon from './stop.svg';

type StopButtonProps = Pick<ActionButtonProps, 'label' | 'keyboardShortcut'>;

const StopButton: React.VoidFunctionComponent<StopButtonProps> = ({
    label,
    keyboardShortcut,
}) => {
    const runtime = useSelector((s) => s.hub.runtime);

    const dispatch = useDispatch();

    return (
        <ActionButton
            label={label}
            keyboardShortcut={keyboardShortcut}
            tooltip={TooltipId.Stop}
            icon={stopIcon}
            enabled={runtime === HubRuntimeState.Running}
            onAction={() => dispatch(stop())}
        />
    );
};

export default StopButton;
