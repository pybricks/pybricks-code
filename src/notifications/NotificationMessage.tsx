// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// provides translation for notification text

import { Replacements, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { I18nId } from './i18n';

type NotificationMessageProps = {
    messageId: I18nId;
    replacements?: Replacements;
};

const NotificationMessage: React.VoidFunctionComponent<NotificationMessageProps> = ({
    messageId,
    replacements,
}) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

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
};

export default NotificationMessage;
