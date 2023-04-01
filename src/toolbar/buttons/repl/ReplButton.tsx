// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import { hubStartRepl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type ReplButtonProps = Pick<ActionButtonProps, 'id'>;

const ReplButton: React.VoidFunctionComponent<ReplButtonProps> = ({ id }) => {
    const { runtime, useLegacyDownload, hasRepl } = useSelector((s) => s.hub);
    const i18n = useI18n();
    const dispatch = useDispatch();

    const action = useCallback(
        () => dispatch(hubStartRepl(useLegacyDownload)),
        [dispatch, useLegacyDownload],
    );

    const busy = useDebounce(runtime === HubRuntimeState.StartingRepl, 250);

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            tooltip={i18n.translate('tooltip')}
            icon={icon}
            enabled={hasRepl && runtime === HubRuntimeState.Idle}
            showProgress={busy}
            onAction={action}
        />
    );
};

export default ReplButton;
