// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import { hubStopUserProgram } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type StopButtonProps = Pick<ActionButtonProps, 'id'>;

const StopButton: React.VoidFunctionComponent<StopButtonProps> = ({ id }) => {
    const runtime = useSelector((s) => s.hub.runtime);
    const keyboardShortcut = 'F6';

    const i18n = useI18n();
    const dispatch = useDispatch();

    const busy = useDebounce(runtime === HubRuntimeState.StoppingUserProgram, 250);

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            keyboardShortcut={keyboardShortcut}
            tooltip={i18n.translate('tooltip', { key: keyboardShortcut })}
            icon={icon}
            enabled={runtime === HubRuntimeState.Running}
            showProgress={busy}
            onAction={() => dispatch(hubStopUserProgram())}
        />
    );
};

export default StopButton;
