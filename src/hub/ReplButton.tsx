// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { repl } from './actions';
import { HubRuntimeState } from './reducers';
import replIcon from './repl.svg';

type ReplButtonProps = Pick<ActionButtonProps, 'label' | 'keyboardShortcut'>;

const ReplButton: React.VoidFunctionComponent<ReplButtonProps> = ({
    label,
    keyboardShortcut,
}) => {
    const enabled = useSelector((s) => s.hub.runtime === HubRuntimeState.Idle);
    const dispatch = useDispatch();
    const action = useCallback(() => dispatch(repl()), [dispatch]);

    return (
        <ActionButton
            label={label}
            keyboardShortcut={keyboardShortcut}
            tooltip={TooltipId.Repl}
            icon={replIcon}
            enabled={enabled}
            onAction={action}
        />
    );
};

export default ReplButton;
