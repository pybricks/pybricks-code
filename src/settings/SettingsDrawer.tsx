// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import {
    AnchorButton,
    Button,
    ButtonGroup,
    Classes,
    ControlGroup,
    Drawer,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    Label,
    Position,
    Switch,
    Tooltip,
    useHotkeys,
} from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AboutDialog from '../about/AboutDialog';
import { checkForUpdate, installPrompt, reload } from '../app/actions';
import {
    pybricksBugReportsUrl,
    pybricksGitterUrl,
    pybricksProjectsUrl,
    pybricksSupportUrl,
    tooltipDelay,
} from '../app/constants';
import { pseudolocalize } from '../i18n';
import { RootState } from '../reducers';
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

const SettingsDrawer: React.FunctionComponent<SettingsProps> = (props) => {
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

    const showDocs = useSelector((state: RootState) => state.settings.showDocs);
    const darkMode = useSelector((state: RootState) => state.settings.darkMode);
    const flashCurrentProgram = useSelector(
        (state: RootState) => state.settings.flashCurrentProgram,
    );
    const serviceWorker = useSelector((state: RootState) => state.app.serviceWorker);
    const checkingForUpdate = useSelector(
        (state: RootState) => state.app.checkingForUpdate,
    );
    const updateAvailable = useSelector(
        (state: RootState) => state.app.updateAvailable,
    );
    const beforeInstallPrompt = useSelector(
        (state: RootState) => state.app.beforeInstallPrompt,
    );
    const promptingInstall = useSelector(
        (state: RootState) => state.app.promptingInstall,
    );
    const readyForOfflineUse = useSelector(
        (state: RootState) => state.app.readyForOfflineUse,
    );
    const hubName = useSelector((state: RootState) => state.settings.hubName);
    const isHubNameValid = useSelector(
        (state: RootState) => state.settings.isHubNameValid,
    );

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
        [],
    );

    useHotkeys(hotkeys);

    return (
        <Drawer
            isOpen={props.isOpen}
            icon="cog"
            size={Drawer.SIZE_SMALL}
            title={i18n.translate(SettingsStringId.Title)}
            onClose={() => props.onClose()}
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
                        <Tooltip
                            content={i18n.translate(
                                SettingsStringId.AppearanceDocumentationTooltip,
                            )}
                            boundary="window"
                            position={Position.LEFT}
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
                        </Tooltip>
                        <Tooltip
                            content={i18n.translate(
                                SettingsStringId.AppearanceDarkModeTooltip,
                            )}
                            boundary="window"
                            position={Position.LEFT}
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
                        </Tooltip>
                    </FormGroup>
                    <FormGroup label={i18n.translate(SettingsStringId.FirmwareTitle)}>
                        <Tooltip
                            content={i18n.translate(
                                SettingsStringId.FirmwareCurrentProgramTooltip,
                            )}
                            boundary="window"
                            position={Position.LEFT}
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
                        </Tooltip>
                        <ControlGroup>
                            <Tooltip
                                content={i18n.translate(
                                    SettingsStringId.FirmwareHubNameTooltip,
                                )}
                                boundary="window"
                                position={Position.LEFT}
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
                            </Tooltip>
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
                                        <Tooltip
                                            content={i18n.translate(
                                                SettingsStringId.FirmwareHubNameErrorTooltip,
                                            )}
                                            boundary="window"
                                            position={Position.BOTTOM}
                                            targetTagName="div"
                                        >
                                            <Icon
                                                icon="error"
                                                intent={Intent.DANGER}
                                                itemType="div"
                                            />
                                        </Tooltip>
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
                            {beforeInstallPrompt && (
                                <Button
                                    icon="add"
                                    onClick={() =>
                                        dispatch(installPrompt(beforeInstallPrompt))
                                    }
                                    loading={promptingInstall}
                                >
                                    {i18n.translate(SettingsStringId.AppInstallLabel)}
                                </Button>
                            )}
                            {serviceWorker && !updateAvailable && (
                                <Button
                                    icon="refresh"
                                    onClick={() =>
                                        dispatch(checkForUpdate(serviceWorker))
                                    }
                                    loading={checkingForUpdate}
                                >
                                    {i18n.translate(
                                        SettingsStringId.AppCheckForUpdateLabel,
                                    )}
                                </Button>
                            )}
                            {serviceWorker && updateAvailable && (
                                <Button
                                    icon="refresh"
                                    onClick={() => dispatch(reload(serviceWorker))}
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
