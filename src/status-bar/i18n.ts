// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors
//
// Status bar translation keys.

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    CompletionEngineStatusLabel = 'completionEngineStatus.label',
    CompletionEngineStatusMessageLoading = 'completionEngineStatus.message.loading',
    CompletionEngineStatusMessageReady = 'completionEngineStatus.message.ready',
    CompletionEngineStatusMessageFailed = 'completionEngineStatus.message.failed',
    CompletionEngineStatusMessageUnknown = 'completionEngineStatus.message.unknown',
    BatteryTitle = 'battery.title',
    BatteryLow = 'battery.low',
    BatteryOk = 'battery.ok',
    HubInfoTitle = 'hubInfo.title',
    HubInfoConnectedTo = 'hubInfo.connectedTo',
    HubInfoHubType = 'hubInfo.hubType',
    HubInfoFirmware = 'hubInfo.firmware',
}
