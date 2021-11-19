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
    Hotkey,
    Hotkeys,
    HotkeysTarget,
    Icon,
    InputGroup,
    Intent,
    Label,
    Position,
    Switch,
    Tooltip,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
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
import { BeforeInstallPromptEvent } from '../utils/dom';
import { isMacOS } from '../utils/os';
import { setBoolean, setString, toggleBoolean } from './actions';
import { BooleanSettingId, StringSettingId } from './defaults';
import { SettingsStringId } from './i18n';
import en from './i18n.en.json';
import './settings.scss';

type StateProps = {
    showDocs: boolean;
    darkMode: boolean;
    flashCurrentProgram: boolean;
    serviceWorker: ServiceWorkerRegistration | null;
    checkingForUpdate: boolean;
    updateAvailable: boolean;
    beforeInstallPrompt: BeforeInstallPromptEvent | null;
    promptingInstall: boolean;
    readyForOfflineUse: boolean;
    hubName: string;
    isHubNameValid: boolean;
};

type DispatchProps = {
    onShowDocsChanged: (checked: boolean) => void;
    onDarkModeChanged: (checked: boolean) => void;
    onFlashCurrentProgramChanged: (checked: boolean) => void;
    onToggleDocs: () => void;
    onCheckForUpdate: (registration: ServiceWorkerRegistration) => void;
    onReload: (registration: ServiceWorkerRegistration) => void;
    onInstallPrompt: (event: BeforeInstallPromptEvent) => void;
    onHubNameChange: React.FormEventHandler<HTMLInputElement>;
};

type OwnProps = {
    isOpen: boolean;
    onClose(): void;
};

type SettingsProps = StateProps & DispatchProps & OwnProps & WithI18nProps;

@HotkeysTarget
class SettingsDrawer extends React.PureComponent<SettingsProps> {
    public state = {
        aboutDialogIsOpen: false,
    };

    render(): JSX.Element {
        const {
            showDocs,
            darkMode,
            serviceWorker,
            flashCurrentProgram,
            checkingForUpdate,
            updateAvailable,
            beforeInstallPrompt,
            promptingInstall,
            readyForOfflineUse,
            onShowDocsChanged,
            onDarkModeChanged,
            onFlashCurrentProgramChanged,
            onCheckForUpdate,
            onReload,
            onInstallPrompt,
            isOpen,
            onClose,
            i18n,
            hubName,
            isHubNameValid,
            onHubNameChange,
        } = this.props;
        return (
            <Drawer
                isOpen={isOpen}
                icon="cog"
                size={Drawer.SIZE_SMALL}
                title={i18n.translate(SettingsStringId.Title)}
                onClose={() => onClose()}
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
                                        onShowDocsChanged(
                                            (e.target as HTMLInputElement).checked,
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
                                        onDarkModeChanged(
                                            (e.target as HTMLInputElement).checked,
                                        )
                                    }
                                />
                            </Tooltip>
                        </FormGroup>
                        <FormGroup
                            label={i18n.translate(SettingsStringId.FirmwareTitle)}
                        >
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
                                        onFlashCurrentProgramChanged(
                                            (e.target as HTMLInputElement).checked,
                                        )
                                    }
                                />
                            </Tooltip>
                            <ControlGroup>
                                <Label className={Classes.INLINE}>
                                    {i18n.translate(
                                        SettingsStringId.FirmwareHubNameLabel,
                                    )}
                                    <InputGroup
                                        value={hubName}
                                        onChange={onHubNameChange}
                                        className="pb-hub-name-input"
                                        intent={
                                            isHubNameValid ? Intent.NONE : Intent.DANGER
                                        }
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
                                </Label>
                            </ControlGroup>
                        </FormGroup>
                        <FormGroup label={i18n.translate(SettingsStringId.HelpTitle)}>
                            <ButtonGroup
                                minimal={true}
                                vertical={true}
                                alignText="left"
                            >
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
                                    isOpen={this.state.aboutDialogIsOpen}
                                    onClose={() =>
                                        this.setState({ aboutDialogIsOpen: false })
                                    }
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
                            <ButtonGroup
                                minimal={true}
                                vertical={true}
                                alignText="left"
                            >
                                {beforeInstallPrompt && (
                                    <Button
                                        icon="add"
                                        onClick={() =>
                                            onInstallPrompt(beforeInstallPrompt)
                                        }
                                        loading={promptingInstall}
                                    >
                                        {i18n.translate(
                                            SettingsStringId.AppInstallLabel,
                                        )}
                                    </Button>
                                )}
                                {serviceWorker && !updateAvailable && (
                                    <Button
                                        icon="refresh"
                                        onClick={() => onCheckForUpdate(serviceWorker)}
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
                                        onClick={() => onReload(serviceWorker)}
                                    >
                                        {i18n.translate(
                                            SettingsStringId.AppRestartLabel,
                                        )}
                                    </Button>
                                )}
                                <Button
                                    icon="info-sign"
                                    onClick={() => {
                                        this.setState({ aboutDialogIsOpen: true });
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
                                    onChange={() =>
                                        pseudolocalize(!i18n.pseudolocalize)
                                    }
                                    label="Pseudolocalize"
                                />
                            </FormGroup>
                        )}
                    </div>
                </div>
            </Drawer>
        );
    }

    renderHotkeys(): JSX.Element {
        return (
            <Hotkeys>
                <Hotkey
                    combo="mod+d"
                    label={this.props.i18n.translate(
                        SettingsStringId.AppearanceDocumentationTooltip,
                    )}
                    global={true}
                    preventDefault={true}
                    onKeyDown={() => this.props.onToggleDocs()}
                />
            </Hotkeys>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    showDocs: state.settings.showDocs,
    darkMode: state.settings.darkMode,
    flashCurrentProgram: state.settings.flashCurrentProgram,
    serviceWorker: state.app.serviceWorker,
    checkingForUpdate: state.app.checkingForUpdate,
    updateAvailable: state.app.updateAvailable,
    beforeInstallPrompt: state.app.beforeInstallPrompt,
    promptingInstall: state.app.promptingInstall,
    readyForOfflineUse: state.app.readyForOfflineUse,
    hubName: state.settings.hubName,
    isHubNameValid: state.settings.isHubNameValid,
});

const mapDispatchToProps: DispatchProps = {
    onShowDocsChanged: (checked) => setBoolean(BooleanSettingId.ShowDocs, checked),
    onDarkModeChanged: (checked) => setBoolean(BooleanSettingId.DarkMode, checked),
    onFlashCurrentProgramChanged: (checked) =>
        setBoolean(BooleanSettingId.FlashCurrentProgram, checked),
    onToggleDocs: () => toggleBoolean(BooleanSettingId.ShowDocs),
    onCheckForUpdate: checkForUpdate,
    onReload: reload,
    onInstallPrompt: installPrompt,
    onHubNameChange: (event) =>
        setString(StringSettingId.HubName, event.currentTarget.value),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(
    withI18n({
        id: 'settings',
        fallback: en,
        translations: { en },
    })(SettingsDrawer),
);
