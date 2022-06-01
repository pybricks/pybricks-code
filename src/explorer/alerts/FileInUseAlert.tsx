// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import { CreateToast } from '../../i18nToaster';
import { I18nId, useI18n } from './i18n';

type FileInUseAlertProps = {
    fileName: string;
};

const FileInUseAlert: React.VoidFunctionComponent<FileInUseAlertProps> = ({
    fileName,
}) => {
    const i18n = useI18n();
    return <>{i18n.translate(I18nId.FileInUseMessage, { fileName })}</>;
};

export const fileInUse: CreateToast<{ fileName: string }> = (
    onAction,
    { fileName },
) => {
    return {
        message: <FileInUseAlert fileName={fileName} />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
