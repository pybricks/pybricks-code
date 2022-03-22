// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// provides translation for notification text

import { Replacements, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { I18nId } from './i18n';

type NotificationActionProps = {
    messageId: I18nId;
    replacements?: Replacements;
};

const NotificationAction: React.VoidFunctionComponent<NotificationActionProps> = ({
    messageId,
    replacements,
}) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return <>{i18n.translate(messageId, replacements)}</>;
};

export default NotificationAction;
