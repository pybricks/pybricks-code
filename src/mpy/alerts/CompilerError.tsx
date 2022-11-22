// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Intent } from '@blueprintjs/core';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { editorGoto } from '../../editor/actions';
import { useFileStorageUuid } from '../../fileStorage/hooks';
import type { CreateToast } from '../../toasterTypes';
import { useI18n } from './i18n';

type CompilerErrorProps = {
    error: string[];
};

const CompilerError: React.VoidFunctionComponent<CompilerErrorProps> = ({ error }) => {
    const dispatch = useDispatch();
    const i18n = useI18n();

    const [file, line] = useMemo(() => {
        for (const line of error) {
            const match = line.match(/^ {2}File "(.*)", line (\d+)/);

            if (match) {
                return [match[1], Number(match[2])];
            }
        }

        return [undefined, undefined];
    }, [error]);

    const uuid = useFileStorageUuid(file ?? '');

    return (
        <>
            <p>{i18n.translate('compilerError.message')}</p>
            <pre className="pb-mpy-alerts-compile-error">{error.join('\n')}</pre>
            {file && uuid && (
                <Button icon="code" onClick={() => dispatch(editorGoto(uuid, line))}>
                    {i18n.translate('compilerError.gotoErrorButton')}
                </Button>
            )}
        </>
    );
};

export const compilerError: CreateToast<CompilerErrorProps, 'dismiss' | 'gotoError'> = (
    onAction,
    props,
) => ({
    message: <CompilerError {...props} />,
    icon: 'error',
    intent: Intent.DANGER,
    timeout: 0,
    onDismiss: () => onAction('dismiss'),
});
