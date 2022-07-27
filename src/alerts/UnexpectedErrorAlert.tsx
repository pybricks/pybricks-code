// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './UnexpectedErrorAlert.scss';
import {
    AnchorButton,
    Button,
    ButtonGroup,
    Collapse,
    Intent,
    Pre,
} from '@blueprintjs/core';
import React, { useState } from 'react';
import { useId } from 'react-aria';
import { CreateToast } from '../i18nToaster';
import { useI18n } from './i18n';

type UnexpectedErrorAlertProps = {
    error: Error;
};

const UnexpectedErrorAlert: React.VoidFunctionComponent<UnexpectedErrorAlertProps> = ({
    error,
}) => {
    const i18n = useI18n();
    const [isExpanded, setIsExpanded] = useState(false);
    const labelId = useId();

    return (
        <>
            <p>{i18n.translate('message', { errorMessage: error.message })}</p>
            <span>
                <Button
                    aria-labelledby={labelId}
                    minimal={true}
                    small={true}
                    icon={isExpanded ? 'chevron-down' : 'chevron-right'}
                    onClick={() => setIsExpanded((v) => !v)}
                />
                <span id={labelId}>{i18n.translate('technicalInfo')}</span>
            </span>
            <Collapse isOpen={isExpanded}>
                <Pre className="pb-alerts-stack-trace">{error.stack}</Pre>
            </Collapse>
            <div>
                <ButtonGroup minimal={true} fill={true}>
                    <Button
                        intent={Intent.DANGER}
                        icon="duplicate"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `\`\`\`\n${error.stack || error.message}\n\`\`\``,
                            )
                        }
                    >
                        {i18n.translate('copyErrorMessage')}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon="virus"
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(error.message)}`}
                        target="_blank"
                    >
                        {i18n.translate('reportBug')}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
};

export const unexpectedError: CreateToast<{ error: Error }> = (onAction, { error }) => {
    return {
        message: <UnexpectedErrorAlert error={error} />,
        icon: 'error',
        intent: Intent.DANGER,
        onDismiss: () => onAction('dismiss'),
    };
};
