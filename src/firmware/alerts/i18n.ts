// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    NoWebUsbMessage = 'noWebUsb.message',
    NoWebUsbSuggestion = 'noWebUsb.suggestion',
    NoDfuHubMessage = 'noDfuHub.message',
    NoDfuHubSuggestion1Windows = 'noDfuHub.suggestion1.windows',
    NoDfuHubSuggestion1Linux = 'noDfuHub.suggestion1.linux',
    NoDfuHubSuggestion2 = 'noDfuHub.suggestion2',
    NoDfuHubTroubleshootButton = 'noDfuHub.troubleshootButton',
    NoDfuInterfaceMessage = 'noDfuInterface.message',
    FirmwareMismatchMessage = 'firmwareMismatch.message',
}
