// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    NoWebBluetoothMessage = 'noWebBluetooth.message',
    NoWebBluetoothSuggestion = 'noWebBluetooth.suggestion',
    NoWebBluetoothLinux = 'noWebBluetooth.linux',
    BluetoothNotAvailableMessage = 'bluetoothNotAvailable.message',
    BluetoothNotAvailableSuggestion = 'bluetoothNotAvailable.suggestion',
    NoGattMessage = 'noGatt.message',
    MissingServiceMessage = 'missingService.message',
    MissingServiceSuggestion1 = 'missingService.suggestion1',
    MissingServiceSuggestion2 = 'missingService.suggestion2',
    NoHubMessage = 'noHub.message',
    NoHubSuggestion1 = 'noHub.suggestion1',
    NoHubSuggestion2 = 'noHub.suggestion2',
    NoHubFlashFirmwareButton = 'noHub.flashFirmwareButton',
    NoHubTroubleshootButton = 'noHub.troubleshootButton',
}
