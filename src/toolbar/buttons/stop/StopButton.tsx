// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { stop } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

type StopButtonProps = Pick<ActionButtonProps, 'elementRef'>;

const StopButton: React.VoidFunctionComponent<StopButtonProps> = ({ elementRef }) => {
    const runtime = useSelector((s) => s.hub.runtime);
    const keyboardShortcut = 'F6';

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            label={i18n.translate(I18nId.Label)}
            keyboardShortcut={keyboardShortcut}
            tooltip={i18n.translate(I18nId.Tooltip, { key: keyboardShortcut })}
            icon={icon}
            enabled={runtime === HubRuntimeState.Running}
            elementRef={elementRef}
            onAction={() => dispatch(stop())}
        />
    );
};

export default StopButton;
