// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Provides special notification contents for unexpected errors.

import { AnchorButton, Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { MessageId } from './notification-i18n';
import en from './notification-i18n.en.json';

type OwnProps = {
    messageId: MessageId;
    err: Error;
};

export default function UnexpectedErrorNotification(props: OwnProps): JSX.Element {
    const [i18n] = useI18n({
        id: 'notification',
        translations: { en },
        fallback: en,
    });
    const { messageId, err } = props;
    return (
        <>
            <p>{i18n.translate(messageId, { errorMessage: err.message })}</p>
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
                        {i18n.translate(MessageId.CopyErrorMessage)}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon="virus"
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(err.message)}`}
                        target="_blank"
                    >
                        {i18n.translate(MessageId.ReportBug)}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
}
