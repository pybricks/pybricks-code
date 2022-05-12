// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    AnchorButton,
    Button,
    ButtonGroup,
    ControlGroup,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    Label,
    Switch,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import AboutDialog from '../about/AboutDialog';
import { appCheckForUpdate, appReload, appShowInstallPrompt } from '../app/actions';
import {
    pybricksBugReportsUrl,
    pybricksGitterUrl,
    pybricksProjectsUrl,
    pybricksSupportUrl,
    tooltipDelay,
} from '../app/constants';
import { pseudolocalize } from '../i18n';
import { useSelector } from '../reducers';
import ExternalLinkIcon from '../utils/ExternalLinkIcon';
import { isMacOS } from '../utils/os';
import {
    useSettingFlashCurrentProgram,
    useSettingHubName,
    useSettingIsShowDocsEnabled,
} from './hooks';
import { I18nId } from './i18n';
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

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return (
        <div aria-label={i18n.translate(I18nId.Title)}>
            <FormGroup
                label={i18n.translate(I18nId.AppearanceTitle)}
                helperText={i18n.translate(I18nId.AppearanceZoomHelp, {
                    in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                    out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                })}
            >
                <Tooltip2
                    content={i18n.translate(I18nId.AppearanceDocumentationTooltip)}
                    rootBoundary="document"
                    placement="left"
                    targetTagName="div"
                    hoverOpenDelay={tooltipDelay}
                >
                    <Switch
                        label={i18n.translate(I18nId.AppearanceDocumentationLabel)}
                        checked={isSettingShowDocsEnabled}
                        onChange={(e) =>
                            setIsSettingShowDocsEnabled(
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                </Tooltip2>
                <Tooltip2
                    content={i18n.translate(I18nId.AppearanceDarkModeTooltip)}
                    rootBoundary="document"
                    placement="left"
                    targetTagName="div"
                    hoverOpenDelay={tooltipDelay}
                >
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
                </Tooltip2>
            </FormGroup>
            <FormGroup label={i18n.translate(I18nId.FirmwareTitle)}>
                <Tooltip2
                    content={i18n.translate(I18nId.FirmwareCurrentProgramTooltip)}
                    rootBoundary="document"
                    placement="left"
                    targetTagName="div"
                    hoverOpenDelay={tooltipDelay}
                >
                    <Switch
                        label={i18n.translate(I18nId.FirmwareCurrentProgramLabel)}
                        checked={isFlashCurrentProgramEnabled}
                        onChange={(e) =>
                            setIsFlashCurrentProgramEnabled(
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                </Tooltip2>
                <ControlGroup vertical={true}>
                    <Tooltip2
                        content={i18n.translate(I18nId.FirmwareHubNameTooltip)}
                        rootBoundary="document"
                        placement="left"
                        targetTagName="div"
                        hoverOpenDelay={tooltipDelay}
                        openOnTargetFocus={false}
                    >
                        <Label htmlFor="hub-name-input">
                            {i18n.translate(I18nId.FirmwareHubNameLabel)}
                        </Label>
                    </Tooltip2>
                    <InputGroup
                        id="hub-name-input"
                        value={hubName}
                        onChange={(e) => setHubName(e.currentTarget.value)}
                        onMouseOver={(e) => e.preventDefault()}
                        className="pb-hub-name-input"
                        intent={isHubNameValid ? Intent.NONE : Intent.DANGER}
                        placeholder="Pybricks Hub"
                        rightElement={
                            isHubNameValid ? undefined : (
                                <Tooltip2
                                    content={i18n.translate(
                                        I18nId.FirmwareHubNameErrorTooltip,
                                    )}
                                    rootBoundary="document"
                                    placement="bottom"
                                    targetTagName="div"
                                >
                                    <Icon
                                        icon="error"
                                        intent={Intent.DANGER}
                                        itemType="div"
                                    />
                                </Tooltip2>
                            )
                        }
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
                            icon="add"
                            onClick={() => dispatch(appShowInstallPrompt())}
                            loading={promptingInstall}
                        >
                            {i18n.translate(I18nId.AppInstallLabel)}
                        </Button>
                    )}
                    {isServiceWorkerRegistered && !updateAvailable && (
                        <Button
                            icon="refresh"
                            onClick={() => dispatch(appCheckForUpdate())}
                            loading={checkingForUpdate}
                        >
                            {i18n.translate(I18nId.AppCheckForUpdateLabel)}
                        </Button>
                    )}
                    {isServiceWorkerRegistered && updateAvailable && (
                        <Button icon="refresh" onClick={() => dispatch(appReload())}>
                            {i18n.translate(I18nId.AppRestartLabel)}
                        </Button>
                    )}
                    <Button
                        icon="info-sign"
                        onClick={() => {
                            setIsAboutDialogOpen(true);
                            return true;
                        }}
                    >
                        {i18n.translate(I18nId.AppAboutLabel)}
                    </Button>
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
