// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Provides special notification contents for unexpected errors.

import { AnchorButton, Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { MessageId } from './i18n';
import en from './i18n.en.json';

type UnexpectedErrorNotificationProps = {
    messageId: MessageId;
    err: Error;
};

const UnexpectedErrorNotification: React.FC<UnexpectedErrorNotificationProps> = (
    props,
) => {
    const [i18n] = useI18n({
        id: 'notification',
        translations: { en },
        fallback: en,
    });

    return (
        <>
            <p>
                {i18n.translate(props.messageId, { errorMessage: props.err.message })}
            </p>
            <div>
                <ButtonGroup minimal={true} fill={true}>
                    <Button
                        intent={Intent.DANGER}
                        icon="duplicate"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `\`\`\`\n${
                                    props.err.stack || props.err.message
                                }\n\`\`\``,
                            )
                        }
                    >
                        {i18n.translate(MessageId.CopyErrorMessage)}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon="virus"
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(props.err.message)}`}
                        target="_blank"
                    >
                        {i18n.translate(MessageId.ReportBug)}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
};

export default UnexpectedErrorNotification;
