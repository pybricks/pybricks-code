// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors
//
// Settings translation keys.

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    Title = 'title',
    AppearanceTitle = 'appearance.title',
    AppearanceDocumentationLabel = 'appearance.documentation.label',
    AppearanceDocumentationHelp = 'appearance.documentation.help',
    AppearanceDarkModeLabel = 'appearance.darkMode.label',
    AppearanceDarkModeHelp = 'appearance.darkMode.help',
    AppearanceZoomHelp = 'appearance.zoom.help',
    FirmwareTitle = 'firmware.title',
    FirmwareFlashPybricksLabel = 'firmware.flashPybricksButton.label',
    FirmwareFlashLegoLabel = 'firmware.flashLegoButton.label',
    HelpTitle = 'help.title',
    HelpProjectsLabel = 'help.projects.label',
    HelpSupportLabel = 'help.support.label',
    HelpChatLabel = 'help.chat.label',
    HelpBugsLabel = 'help.bugs.label',
    AppTitle = 'app.title',
    AppOfflineUseHelp = 'app.offlineUseHelp',
    AppInstallLabel = 'app.install.label',
    AppCheckForUpdateLabel = 'app.checkForUpdate.label',
    AppRestartLabel = 'app.restart.label',
    AppAboutLabel = 'app.about.label',
}
