// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    AnchorButton,
    ButtonGroup,
    ControlGroup,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    Label,
    Switch,
} from '@blueprintjs/core';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import AboutDialog from '../about/AboutDialog';
import { appCheckForUpdate, appReload, appShowInstallPrompt } from '../app/actions';
import {
    appName,
    pybricksBugReportsUrl,
    pybricksGitterUrl,
    pybricksProjectsUrl,
    pybricksSupportUrl,
} from '../app/constants';
import { Button } from '../components/Button';
import HelpButton from '../components/HelpButton';
import { pseudolocalize } from '../i18n';
import { useSelector } from '../reducers';
import ExternalLinkIcon from '../utils/ExternalLinkIcon';
import { isMacOS } from '../utils/os';
import {
    useSettingFlashCurrentProgram,
    useSettingHubName,
    useSettingIsShowDocsEnabled,
} from './hooks';
import { I18nId, useI18n } from './i18n';
import './settings.scss';

const Settings: React.VoidFunctionComponent = () => {
    const { isSettingShowDocsEnabled, setIsSettingShowDocsEnabled } =
        useSettingIsShowDocsEnabled();
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const { isDarkMode, setTernaryDarkMode } = useTernaryDarkMode();

    const [isFlashCurrentProgramEnabled, setIsFlashCurrentProgramEnabled] =
        useSettingFlashCurrentProgram();
    const isServiceWorkerRegistered = useSelector(
        (s) => s.app.isServiceWorkerRegistered,
    );
    const checkingForUpdate = useSelector((s) => s.app.checkingForUpdate);
    const updateAvailable = useSelector((s) => s.app.updateAvailable);
    const hasUnresolvedInstallPrompt = useSelector(
        (s) => s.app.hasUnresolvedInstallPrompt,
    );
    const promptingInstall = useSelector((s) => s.app.promptingInstall);
    const readyForOfflineUse = useSelector((s) => s.app.readyForOfflineUse);
    const { hubName, isHubNameValid, setHubName } = useSettingHubName();

    const dispatch = useDispatch();

    const i18n = useI18n();

    return (
        <div className="pb-settings">
            <FormGroup
                label={i18n.translate(I18nId.AppearanceTitle)}
                helperText={i18n.translate(I18nId.AppearanceZoomHelp, {
                    in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                    out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                })}
            >
                <ControlGroup>
                    <Switch
                        label={i18n.translate(I18nId.AppearanceDocumentationLabel)}
                        checked={isSettingShowDocsEnabled}
                        onChange={(e) =>
                            setIsSettingShowDocsEnabled(
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={i18n.translate(
                            I18nId.AppearanceDocumentationLabel,
                        )}
                        content={i18n.translate(I18nId.AppearanceDocumentationHelp)}
                    />
                </ControlGroup>
                <ControlGroup>
                    <Switch
                        label={i18n.translate(I18nId.AppearanceDarkModeLabel)}
                        checked={isDarkMode}
                        onChange={(e) =>
                            setTernaryDarkMode(
                                (e.target as HTMLInputElement).checked
                                    ? 'dark'
                                    : 'light',
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={i18n.translate(I18nId.AppearanceDarkModeLabel)}
                        content={i18n.translate(I18nId.AppearanceDarkModeHelp)}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup label={i18n.translate(I18nId.FirmwareTitle)}>
                <ControlGroup>
                    <Switch
                        label={i18n.translate(I18nId.FirmwareCurrentProgramLabel)}
                        checked={isFlashCurrentProgramEnabled}
                        onChange={(e) =>
                            setIsFlashCurrentProgramEnabled(
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={i18n.translate(
                            I18nId.FirmwareCurrentProgramLabel,
                        )}
                        content={i18n.translate(I18nId.FirmwareCurrentProgramHelp, {
                            appName,
                        })}
                    />
                </ControlGroup>
                <Label htmlFor="hub-name-input">
                    {i18n.translate(I18nId.FirmwareHubNameLabel)}
                </Label>
                <ControlGroup>
                    <InputGroup
                        id="hub-name-input"
                        value={hubName}
                        onChange={(e) => setHubName(e.currentTarget.value)}
                        onMouseOver={(e) => e.preventDefault()}
                        onMouseDown={(e) => e.stopPropagation()}
                        intent={isHubNameValid ? Intent.NONE : Intent.DANGER}
                        placeholder="Pybricks Hub"
                        rightElement={
                            isHubNameValid ? undefined : (
                                <Icon
                                    icon="error"
                                    intent={Intent.DANGER}
                                    itemType="div"
                                />
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={i18n.translate(I18nId.FirmwareHubNameLabel)}
                        content={i18n.translate(I18nId.FirmwareHubNameHelp)}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup label={i18n.translate(I18nId.HelpTitle)}>
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    <AnchorButton
                        icon="lightbulb"
                        href={pybricksProjectsUrl}
                        target="blank_"
                    >
                        {i18n.translate(I18nId.HelpProjectsLabel)}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton icon="help" href={pybricksSupportUrl} target="blank_">
                        {i18n.translate(I18nId.HelpSupportLabel)}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton icon="chat" href={pybricksGitterUrl} target="blank_">
                        {i18n.translate(I18nId.HelpChatLabel)}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        icon="virus"
                        href={pybricksBugReportsUrl}
                        target="blank_"
                    >
                        {i18n.translate(I18nId.HelpBugsLabel)}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AboutDialog
                        isOpen={isAboutDialogOpen}
                        onClose={() => setIsAboutDialogOpen(false)}
                    />
                </ButtonGroup>
            </FormGroup>
            <FormGroup
                label={i18n.translate(I18nId.AppTitle)}
                helperText={
                    readyForOfflineUse && i18n.translate(I18nId.AppOfflineUseHelp)
                }
            >
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    {hasUnresolvedInstallPrompt && (
                        <Button
                            label={i18n.translate(I18nId.AppInstallLabel)}
                            icon="add"
                            onPress={() => dispatch(appShowInstallPrompt())}
                            loading={promptingInstall}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && !updateAvailable)) && (
                        <Button
                            label={i18n.translate(I18nId.AppCheckForUpdateLabel)}
                            icon="refresh"
                            onPress={() => dispatch(appCheckForUpdate())}
                            loading={checkingForUpdate}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && updateAvailable)) && (
                        <Button
                            label={i18n.translate(I18nId.AppRestartLabel)}
                            icon="refresh"
                            onPress={() => dispatch(appReload())}
                        />
                    )}
                    <Button
                        label={i18n.translate(I18nId.AppAboutLabel)}
                        icon="info-sign"
                        onPress={() => {
                            setIsAboutDialogOpen(true);
                            return true;
                        }}
                    />
                </ButtonGroup>
            </FormGroup>
            {process.env.NODE_ENV === 'development' && (
                <FormGroup label="Developer">
                    <Switch
                        checked={i18n.pseudolocalize !== false}
                        onChange={() => pseudolocalize(!i18n.pseudolocalize)}
                        label="Pseudolocalize"
                    />
                </FormGroup>
            )}
        </div>
    );
};

export default Settings;
