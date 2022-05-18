// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Provides special notification contents for unexpected errors.

import './UnexpectedErrorNotification.scss';
import { AnchorButton, Button, ButtonGroup, Collapse, Intent } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useState } from 'react';
import { useId } from 'react-aria';
import { I18nId } from './i18n';

type UnexpectedErrorNotificationProps = {
    messageId: I18nId;
    err: Error;
};

const UnexpectedErrorNotification: React.VoidFunctionComponent<
    UnexpectedErrorNotificationProps
> = ({ messageId, err }) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const [isExpanded, setIsExpanded] = useState(false);
    const labelId = useId();

    return (
        <>
            <p>{i18n.translate(messageId, { errorMessage: err.message })}</p>
            <span>
                <Button
                    aria-labelledby={labelId}
                    minimal={true}
                    small={true}
                    icon={isExpanded ? 'chevron-down' : 'chevron-right'}
                    onClick={() => setIsExpanded((v) => !v)}
                />
                <span id={labelId}>{i18n.translate(I18nId.TechnicalInfo)}</span>
            </span>
            <Collapse isOpen={isExpanded}>
                <pre className="pb-notification-stack-trace">{err.stack}</pre>
            </Collapse>
            <div>
                <ButtonGroup minimal={true} fill={true}>
                    <Button
                        intent={Intent.DANGER}
                        icon="duplicate"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `\`\`\`\n${err.stack || err.message}\n\`\`\``,
                            )
                        }
                    >
                        {i18n.translate(I18nId.CopyErrorMessage)}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon="virus"
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(err.message)}`}
                        target="_blank"
                    >
                        {i18n.translate(I18nId.ReportBug)}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
};

export default UnexpectedErrorNotification;
