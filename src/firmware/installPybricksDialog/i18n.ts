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
    SelectHubPanelTitle = 'selectHubPanel.title',
    SelectHubPanelMessage = 'selectHubPanel.message',
    SelectHubPanelNotOnListButtonLabel = 'selectHubPanel.notOnListButton.label',
    SelectHubPanelNotOnListButtonInfoMindstormsTitle = 'selectHubPanel.notOnListButton.info.mindstorms.title',
    SelectHubPanelNotOnListButtonInfoMindstormsRcx = 'selectHubPanel.notOnListButton.info.mindstorms.rcx',
    SelectHubPanelNotOnListButtonInfoMindstormsNxt = 'selectHubPanel.notOnListButton.info.mindstorms.nxt',
    SelectHubPanelNotOnListButtonInfoMindstormsEv3 = 'selectHubPanel.notOnListButton.info.mindstorms.ev3',
    SelectHubPanelNotOnListButtonInfoPoweredUpTitle = 'selectHubPanel.notOnListButton.info.poweredUp.title',
    SelectHubPanelNotOnListButtonInfoPoweredUpWedo2 = 'selectHubPanel.notOnListButton.info.poweredUp.wedo2',
    SelectHubPanelNotOnListButtonInfoPoweredUpDuploTrain = 'selectHubPanel.notOnListButton.info.poweredUp.duploTrain',
    SelectHubPanelNotOnListButtonInfoPoweredUpMario = 'selectHubPanel.notOnListButton.info.poweredUp.mario',
    SelectHubPanelNotOnListButtonInfoPoweredUpFootnote = 'selectHubPanel.notOnListButton.info.poweredUp.footnote',
    LicensePanelTitle = 'licensePanel.title',
    LicensePanelLicenseTextError = 'licensePanel.licenseText.error',
    LicensePanelAcceptCheckboxLabel = 'licensePanel.acceptCheckbox.label',
    OptionsPanelTitle = 'optionsPanel.title',
    OptionsPanelHubNameLabel = 'optionsPanel.hubName.label',
    OptionsPanelHubNameLabelInfo = 'optionsPanel.hubName.labelInfo',
    OptionsPanelHubNameHelp = 'optionsPanel.hubName.help',
    OptionsPanelHubNameError = 'optionsPanel.hubName.error',
    OptionsPanelCustomMainLabel = 'optionsPanel.customMain.label',
    OptionsPanelCustomMainLabelInfo = 'optionsPanel.customMain.labelInfo',
    OptionsPanelCustomMainNotApplicableMessage = 'optionsPanel.customMain.notApplicable.message',
    OptionsPanelCustomMainIncludeLabel = 'optionsPanel.customMain.include.label',
    OptionsPanelCustomMainIncludeNoSelection = 'optionsPanel.customMain.include.noSelection',
    OptionsPanelCustomMainIncludeNoFiles = 'optionsPanel.customMain.include.noFiles',
    OptionsPanelCustomMainIncludeHelp = 'optionsPanel.customMain.include.help',
    BootloaderPanelTitle = 'bootloaderPanel.title',
    BootloaderPanelInstruction1 = 'bootloaderPanel.instruction1',
    BootloaderPanelButtonBluetooth = 'bootloaderPanel.button.bluetooth',
    BootloaderPanelButtonPower = 'bootloaderPanel.button.power',
    BootloaderPanelLightBluetooth = 'bootloaderPanel.light.bluetooth',
    BootloaderPanelLightStatus = 'bootloaderPanel.light.status',
    BootloaderPanelLightPatternBluetooth = 'bootloaderPanel.lightPattern.bluetooth',
    BootloaderPanelLightPatternStatus = 'bootloaderPanel.lightPattern.status',
    BootloaderPanelStepDisconnectUsb = 'bootloaderPanel.step.disconnectUsb',
    BootloaderPanelStepPowerOff = 'bootloaderPanel.step.powerOff',
    BootloaderPanelStepDisconnectIo = 'bootloaderPanel.step.disconnectIo',
    BootloaderPanelStepHoldButton = 'bootloaderPanel.step.holdButton',
    BootloaderPanelStepConnectUsb = 'bootloaderPanel.step.connectUsb',
    BootloaderPanelStepWaitForLight = 'bootloaderPanel.step.waitForLight',
    BootloaderPanelStepReleaseButton = 'bootloaderPanel.step.releaseButton',
    BootloaderPanelStepKeepHolding = 'bootloaderPanel.step.keepHolding',
    BootloaderPanelInstruction2 = 'bootloaderPanel.instruction2',
    NextButtonLabel = 'nextButton.label',
    BackButtonLabel = 'backButton.label',
    FlashFirmwareButtonLabel = 'flashFirmwareButton.label',
}
