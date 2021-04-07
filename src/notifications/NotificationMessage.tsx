// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// provides translation for notification text

import { Replacements, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { MessageId } from './i18n';
import en from './i18n.en.json';

type OwnProps = {
    messageId: MessageId;
    replacements?: Replacements;
};

export default function NotificationMessage(props: OwnProps): JSX.Element {
    const [i18n] = useI18n({
        id: 'notification',
        translations: { en },
        fallback: en,
    });
    const { messageId, replacements } = props;
    let message = i18n.translate(messageId, replacements) as
        | React.ReactElement
        | string;

    // Use newline characters to create paragraphs
    if (typeof message === 'string') {
        message = (
            <>
                {message.split('\n').map((x, i) => (
                    <p key={i}>{x}</p>
                ))}
            </>
        );
    }

    return message;
}
