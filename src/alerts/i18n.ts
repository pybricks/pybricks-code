// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    Message = 'message',
    TechnicalInfo = 'technicalInfo',
    CopyErrorMessage = 'copyErrorMessage',
    ReportBug = 'reportBug',
}
