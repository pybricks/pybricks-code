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
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { setBoolean, setString, toggleBoolean } from './actions';
import { BooleanSettingId, StringSettingId } from './defaults';
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
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

    const showDocs = useSelector((s) => s.settings.showDocs);
    const darkMode = useSelector((s) => s.settings.darkMode);
    const flashCurrentProgram = useSelector((s) => s.settings.flashCurrentProgram);
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
    const hubName = useSelector((s) => s.settings.hubName);
    const isHubNameValid = useSelector((s) => s.settings.isHubNameValid);

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
                onKeyDown: () => dispatch(toggleBoolean(BooleanSettingId.ShowDocs)),
            },
        ],
        [i18n, dispatch],
    );

    useHotkeys(hotkeys);

    return (
        <Drawer
            isOpen={isOpen}
            icon="cog"
            size={DrawerSize.SMALL}
            title={i18n.translate(SettingsStringId.Title)}
            onClose={onClose}
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
                                checked={showDocs}
                                onChange={(e) =>
                                    dispatch(
                                        setBoolean(
                                            BooleanSettingId.ShowDocs,
                                            (e.target as HTMLInputElement).checked,
                                        ),
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
                                checked={darkMode}
                                onChange={(e) =>
                                    dispatch(
                                        setBoolean(
                                            BooleanSettingId.DarkMode,
                                            (e.target as HTMLInputElement).checked,
                                        ),
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
                                checked={flashCurrentProgram}
                                onChange={(e) =>
                                    dispatch(
                                        setBoolean(
                                            BooleanSettingId.FlashCurrentProgram,
                                            (e.target as HTMLInputElement).checked,
                                        ),
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
                                onChange={(e) =>
                                    dispatch(
                                        setString(
                                            StringSettingId.HubName,
                                            e.currentTarget.value,
                                        ),
                                    )
                                }
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
