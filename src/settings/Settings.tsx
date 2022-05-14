// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    AnchorButton,
    Button,
    ButtonGroup,
    ControlGroup,
    FormGroup,
    IRef,
    Icon,
    InputGroup,
    Intent,
    Label,
    Switch,
} from '@blueprintjs/core';
import { Classes as Classes2, Popover2 } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useState } from 'react';
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

type HelpButtonProps = {
    label: string;
    content: string | JSX.Element;
};

const HelpButton: React.VoidFunctionComponent<HelpButtonProps> = ({
    label,
    content,
}) => {
    const handleOpening = useCallback((node: HTMLElement) => {
        // role must match aria-haspopup
        node.setAttribute('role', 'dialog');
    }, []);

    return (
        <Popover2
            onOpening={handleOpening}
            placement="right"
            shouldReturnFocusOnClose
            popoverClassName={Classes2.POPOVER2_CONTENT_SIZING}
            content={content}
            renderTarget={({ isOpen, ref, ...targetProps }) => (
                <Button
                    aria-label={label}
                    aria-expanded={isOpen}
                    minimal
                    icon="help"
                    elementRef={ref as IRef<HTMLButtonElement>}
                    {...targetProps}
                    // override targetProps
                    aria-haspopup="dialog"
                />
            )}
        />
    );
};

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
        <div className="pb-settings" aria-label={i18n.translate(I18nId.Title)}>
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
                        label={i18n.translate(I18nId.AppearanceDocumentationHelpLabel)}
                        content={i18n.translate(
                            I18nId.AppearanceDocumentationHelpContent,
                        )}
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
                        label={i18n.translate(I18nId.AppearanceDarkModeHelpLabel)}
                        content={i18n.translate(I18nId.AppearanceDarkModeHelpContent)}
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
                        label={i18n.translate(I18nId.FirmwareCurrentProgramHelpLabel)}
                        content={i18n.translate(
                            I18nId.FirmwareCurrentProgramHelpContent,
                            { appName },
                        )}
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
                        label={i18n.translate(I18nId.FirmwareHubNameHelpLabel)}
                        content={i18n.translate(I18nId.FirmwareHubNameHelpContent)}
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
