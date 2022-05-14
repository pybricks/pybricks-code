// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

type RunButtonProps = Pick<ActionButtonProps, 'elementRef'>;

const RunButton: React.VoidFunctionComponent<RunButtonProps> = ({ elementRef }) => {
    const downloadProgress = useSelector((s) => s.hub.downloadProgress);
    const runtime = useSelector((s) => s.hub.runtime);
    const isEditorReady = useSelector((s) => s.editor.isReady);
    const keyboardShortcut = 'F5';

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            label={i18n.translate(I18nId.Label)}
            keyboardShortcut={keyboardShortcut}
            tooltip={
                downloadProgress
                    ? i18n.translate(I18nId.TooltipProgress, {
                          percent: i18n.formatPercentage(downloadProgress),
                      })
                    : i18n.translate(I18nId.TooltipAction, { key: keyboardShortcut })
            }
            icon={icon}
            enabled={isEditorReady && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            elementRef={elementRef}
            onAction={() => dispatch(downloadAndRun())}
        />
    );
};

export default RunButton;
