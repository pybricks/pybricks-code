// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { repl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

type ReplButtonProps = Pick<ActionButtonProps, 'elementRef'>;

const ReplButton: React.VoidFunctionComponent<ReplButtonProps> = ({ elementRef }) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const dispatch = useDispatch();

    const enabled = useSelector((s) => s.hub.runtime === HubRuntimeState.Idle);
    const action = useCallback(() => dispatch(repl()), [dispatch]);

    return (
        <ActionButton
            label={i18n.translate(I18nId.Label)}
            tooltip={i18n.translate(I18nId.Tooltip)}
            icon={icon}
            enabled={enabled}
            elementRef={elementRef}
            onAction={action}
        />
    );
};

export default ReplButton;
