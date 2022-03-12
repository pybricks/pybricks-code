// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// provides translation for notification text

import { Replacements, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { MessageId } from './i18n';
import en from './i18n.en.json';

type NotificationActionProps = {
    messageId: MessageId;
    replacements?: Replacements;
};

const NotificationAction: React.VoidFunctionComponent<NotificationActionProps> = ({
    messageId,
    replacements,
}) => {
    const [i18n] = useI18n({
        id: 'notification',
        translations: { en },
        fallback: en,
    });

    return <>{i18n.translate(messageId, replacements)}</>;
};

export default NotificationAction;
