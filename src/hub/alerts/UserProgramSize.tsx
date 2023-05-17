// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import React from 'react';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type UserProgramSizeProps = {
    /** The actual size of the program in bytes. */
    actual: number;
    /** The maximum allowable size of the program in bytes. */
    max: number;
};

const UserProgramSize: React.FunctionComponent<UserProgramSizeProps> = ({
    actual,
    max,
}) => {
    const i18n = useI18n();
    return (
        <>
            <p>
                {i18n.translate('userProgramSize.message', {
                    actual: i18n.formatNumber(actual),
                    max: i18n.formatNumber(max),
                })}
            </p>
            <p>{i18n.translate('userProgramSize.suggestion')}</p>
        </>
    );
};

export const userProgramSize: CreateToast<UserProgramSizeProps> = (
    onAction,
    props,
) => ({
    message: <UserProgramSize {...props} />,
    icon: 'error',
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
