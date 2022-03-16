// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    AnchorButton,
    Button,
    ButtonGroup,
    Classes,
    ControlGroup,
    Drawer,
    DrawerSize,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    Label,
    Switch,
    useHotkeys,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useMemo, useState } from 'react';
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
import { SettingsStringId } from './i18n';
import en from './i18n.en.json';
import './settings.scss';

type SettingsProps = {
    isOpen: boolean;
    onClose(): void;
};

const SettingsDrawer: React.VoidFunctionComponent<SettingsProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        isSettingShowDocsEnabled,
        setIsSettingShowDocsEnabled,
        toggleIsSettingShowDocsEnabled,
    } = useSettingIsShowDocsEnabled();
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

    const [i18n] = useI18n({
        id: 'settings',
        translations: { en },
        fallback: en,
    });

    const hotkeys = useMemo(
        () => [
            {
                combo: 'mod+d',
                label: i18n.translate(SettingsStringId.AppearanceDocumentationTooltip),
                global: true,
                preventDefault: true,
                onKeyDown: toggleIsSettingShowDocsEnabled,
            },
        ],
        [i18n, toggleIsSettingShowDocsEnabled],
    );

    useHotkeys(hotkeys);

    // HACK: set additional attributes that are not supported via Drawer props
    const handleDrawerOpening = useCallback<(node: HTMLElement) => void>((n) => {
        n.setAttribute('role', 'dialog');
        n.setAttribute('aria-modal', 'true');
        n.setAttribute('aria-labelledby', 'settings-drawer-dialog-title');
    }, []);

    return (
        <Drawer
            isOpen={isOpen}
            icon="cog"
            size={DrawerSize.SMALL}
            title={
                <span id="settings-drawer-dialog-title">
                    {i18n.translate(SettingsStringId.Title)}
                </span>
            }
            onOpening={handleDrawerOpening}
            onClose={onClose}
            // work around https://github.com/palantir/blueprint/issues/5169
            shouldReturnFocusOnClose={false}
        >
            <div className={Classes.DRAWER_BODY}>
                <div className={Classes.DIALOG_BODY}>
                    <FormGroup
                        label={i18n.translate(SettingsStringId.AppearanceTitle)}
                        helperText={i18n.translate(
                            SettingsStringId.AppearanceZoomHelp,
                            {
                                in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                                out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                            },
                        )}
                    >
                        <Tooltip2
                            content={i18n.translate(
                                SettingsStringId.AppearanceDocumentationTooltip,
                            )}
                            rootBoundary="document"
                            placement="left"
                            targetTagName="div"
                            hoverOpenDelay={tooltipDelay}
                        >
                            <Switch
                                label={i18n.translate(
                                    SettingsStringId.AppearanceDocumentationLabel,
                                )}
                                checked={isSettingShowDocsEnabled}
                                onChange={(e) =>
                                    setIsSettingShowDocsEnabled(
                                        (e.target as HTMLInputElement).checked,
                                    )
                                }
                            />
                        </Tooltip2>
                        <Tooltip2
                            content={i18n.translate(
                                SettingsStringId.AppearanceDarkModeTooltip,
                            )}
                            rootBoundary="document"
                            placement="left"
                            targetTagName="div"
                            hoverOpenDelay={tooltipDelay}
                        >
                            <Switch
                                label={i18n.translate(
                                    SettingsStringId.AppearanceDarkModeLabel,
                                )}
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
                    <FormGroup label={i18n.translate(SettingsStringId.FirmwareTitle)}>
                        <Tooltip2
                            content={i18n.translate(
                                SettingsStringId.FirmwareCurrentProgramTooltip,
                            )}
                            rootBoundary="document"
                            placement="left"
                            targetTagName="div"
                            hoverOpenDelay={tooltipDelay}
                        >
                            <Switch
                                label={i18n.translate(
                                    SettingsStringId.FirmwareCurrentProgramLabel,
                                )}
                                checked={isFlashCurrentProgramEnabled}
                                onChange={(e) =>
                                    setIsFlashCurrentProgramEnabled(
                                        (e.target as HTMLInputElement).checked,
                                    )
                                }
                            />
                        </Tooltip2>
                        <ControlGroup>
                            <Tooltip2
                                content={i18n.translate(
                                    SettingsStringId.FirmwareHubNameTooltip,
                                )}
                                rootBoundary="document"
                                placement="left"
                                targetTagName="div"
                                hoverOpenDelay={tooltipDelay}
                                openOnTargetFocus={false}
                            >
                                <Label
                                    className={Classes.INLINE}
                                    htmlFor="hub-name-input"
                                >
                                    {i18n.translate(
                                        SettingsStringId.FirmwareHubNameLabel,
                                    )}
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
                                                SettingsStringId.FirmwareHubNameErrorTooltip,
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
                    <FormGroup label={i18n.translate(SettingsStringId.HelpTitle)}>
                        <ButtonGroup minimal={true} vertical={true} alignText="left">
                            <AnchorButton
                                icon="lightbulb"
                                href={pybricksProjectsUrl}
                                target="blank_"
                            >
                                {i18n.translate(SettingsStringId.HelpProjectsLabel)}
                                <ExternalLinkIcon />
                            </AnchorButton>
                            <AnchorButton
                                icon="help"
                                href={pybricksSupportUrl}
                                target="blank_"
                            >
                                {i18n.translate(SettingsStringId.HelpSupportLabel)}
                                <ExternalLinkIcon />
                            </AnchorButton>
                            <AnchorButton
                                icon="chat"
                                href={pybricksGitterUrl}
                                target="blank_"
                            >
                                {i18n.translate(SettingsStringId.HelpChatLabel)}
                                <ExternalLinkIcon />
                            </AnchorButton>
                            <AnchorButton
                                icon="virus"
                                href={pybricksBugReportsUrl}
                                target="blank_"
                            >
                                {i18n.translate(SettingsStringId.HelpBugsLabel)}
                                <ExternalLinkIcon />
                            </AnchorButton>
                            <AboutDialog
                                isOpen={isAboutDialogOpen}
                                onClose={() => setIsAboutDialogOpen(false)}
                            />
                        </ButtonGroup>
                    </FormGroup>
                    <FormGroup
                        label={i18n.translate(SettingsStringId.AppTitle)}
                        helperText={
                            readyForOfflineUse &&
                            i18n.translate(SettingsStringId.AppOfflineUseHelp)
                        }
                    >
                        <ButtonGroup minimal={true} vertical={true} alignText="left">
                            {hasUnresolvedInstallPrompt && (
                                <Button
                                    icon="add"
                                    onClick={() => dispatch(appShowInstallPrompt())}
                                    loading={promptingInstall}
                                >
                                    {i18n.translate(SettingsStringId.AppInstallLabel)}
                                </Button>
                            )}
                            {isServiceWorkerRegistered && !updateAvailable && (
                                <Button
                                    icon="refresh"
                                    onClick={() => dispatch(appCheckForUpdate())}
                                    loading={checkingForUpdate}
                                >
                                    {i18n.translate(
                                        SettingsStringId.AppCheckForUpdateLabel,
                                    )}
                                </Button>
                            )}
                            {isServiceWorkerRegistered && updateAvailable && (
                                <Button
                                    icon="refresh"
                                    onClick={() => dispatch(appReload())}
                                >
                                    {i18n.translate(SettingsStringId.AppRestartLabel)}
                                </Button>
                            )}
                            <Button
                                icon="info-sign"
                                onClick={() => {
                                    setIsAboutDialogOpen(true);
                                    return true;
                                }}
                            >
                                {i18n.translate(SettingsStringId.AppAboutLabel)}
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
            </div>
        </Drawer>
    );
};

export default SettingsDrawer;
