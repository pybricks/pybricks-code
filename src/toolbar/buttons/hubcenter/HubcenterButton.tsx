// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import { hubcenterShowDialog } from '../../../hubcenter/actions';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type HubcenterButtonProps = Pick<ActionButtonProps, 'id'>;

const HubcenterButton: React.FunctionComponent<HubcenterButtonProps> = ({ id }) => {
    const runtime = useSelector((s) => s.hub.runtime);
    const keyboardShortcut = 'F10';

    const i18n = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label="aa"
            keyboardShortcut={keyboardShortcut}
            tooltip="xx"
            icon={icon}
            //enabled={runtime === HubRuntimeState.Idle}
            onAction={() => dispatch(hubcenterShowDialog())}
            //onAction={() => console.log("hello world")}
        />
    );
};

export default HubcenterButton;
