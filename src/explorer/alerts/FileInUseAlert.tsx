// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type FileInUseAlertProps = {
    fileName: string;
};

const FileInUseAlert: React.FunctionComponent<FileInUseAlertProps> = ({ fileName }) => {
    const i18n = useI18n();
    return <>{i18n.translate('fileInUse.message', { fileName })}</>;
};

export const fileInUse: CreateToast<{ fileName: string }> = (
    onAction,
    { fileName },
) => ({
    message: <FileInUseAlert fileName={fileName} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
