// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    AnchorButton,
    ButtonGroup,
    ControlGroup,
    FormGroup,
    Switch,
} from '@blueprintjs/core';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import AboutDialog from '../about/AboutDialog';
import { appCheckForUpdate, appReload, appShowInstallPrompt } from '../app/actions';
import {
    legoRegisteredTrademark,
    pybricksBugReportsUrl,
    pybricksGitterUrl,
    pybricksProjectsUrl,
    pybricksSupportUrl,
} from '../app/constants';
import { Button } from '../components/Button';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import HelpButton from '../components/HelpButton';
import { firmwareInstallPybricks } from '../firmware/actions';
import { firmwareRestoreOfficialDialogShow } from '../firmware/restoreOfficialDialog/actions';
import { pseudolocalize } from '../i18n';
import { useSelector } from '../reducers';
import { tourStart } from '../tour/actions';
import { isMacOS } from '../utils/os';
import { useSettingIsShowDocsEnabled } from './hooks';
import { useI18n } from './i18n';
import './settings.scss';

const Settings: React.VoidFunctionComponent = () => {
    const { isSettingShowDocsEnabled, setIsSettingShowDocsEnabled } =
        useSettingIsShowDocsEnabled();
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const { isDarkMode, setTernaryDarkMode } = useTernaryDarkMode();

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

    const dispatch = useDispatch();

    const i18n = useI18n();

    return (
        <div className="pb-settings">
            <FormGroup
                label={i18n.translate('appearance.title')}
                helperText={i18n.translate('appearance.zoom.help', {
                    in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                    out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                })}
            >
                <ControlGroup>
                    <Switch
                        label={i18n.translate('appearance.documentation.label')}
                        checked={isSettingShowDocsEnabled}
                        onChange={(e) =>
                            setIsSettingShowDocsEnabled(
                                (e.target as HTMLInputElement).checked,
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={i18n.translate('appearance.documentation.label')}
                        content={i18n.translate('appearance.documentation.help')}
                    />
                </ControlGroup>
                <ControlGroup>
                    <Switch
                        label={i18n.translate('appearance.darkMode.label')}
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
                        helpForLabel={i18n.translate('appearance.darkMode.label')}
                        content={i18n.translate('appearance.darkMode.help')}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup label={i18n.translate('firmware.title')}>
                <Button
                    id="pb-settings-flash-pybricks-button"
                    minimal={true}
                    icon="download"
                    label={i18n.translate('firmware.flashPybricksButton.label')}
                    onPress={() => dispatch(firmwareInstallPybricks())}
                />
                <Button
                    id="pb-settings-flash-official-button"
                    minimal={true}
                    icon="download"
                    label={i18n.translate('firmware.flashLegoButton.label', {
                        lego: legoRegisteredTrademark,
                    })}
                    onPress={() => dispatch(firmwareRestoreOfficialDialogShow())}
                />
            </FormGroup>
            <FormGroup label={i18n.translate('help.title')}>
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    <AnchorButton
                        icon="lightbulb"
                        href={pybricksProjectsUrl}
                        target="blank_"
                    >
                        {i18n.translate('help.projects.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton icon="help" href={pybricksSupportUrl} target="blank_">
                        {i18n.translate('help.support.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton icon="chat" href={pybricksGitterUrl} target="blank_">
                        {i18n.translate('help.chat.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        icon="virus"
                        href={pybricksBugReportsUrl}
                        target="blank_"
                    >
                        {i18n.translate('help.bugs.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AboutDialog
                        isOpen={isAboutDialogOpen}
                        onClose={() => setIsAboutDialogOpen(false)}
                    />
                </ButtonGroup>
            </FormGroup>
            <FormGroup
                label={i18n.translate('app.title')}
                helperText={readyForOfflineUse && i18n.translate('app.offlineUseHelp')}
            >
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    {hasUnresolvedInstallPrompt && (
                        <Button
                            label={i18n.translate('app.install.label')}
                            icon="add"
                            onPress={() => dispatch(appShowInstallPrompt())}
                            loading={promptingInstall}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && !updateAvailable)) && (
                        <Button
                            label={i18n.translate('app.checkForUpdate.label')}
                            icon="refresh"
                            onPress={() => dispatch(appCheckForUpdate())}
                            loading={checkingForUpdate}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && updateAvailable)) && (
                        <Button
                            label={i18n.translate('app.restart.label')}
                            icon="refresh"
                            onPress={() => dispatch(appReload())}
                        />
                    )}
                    <Button
                        label={i18n.translate('app.about.label')}
                        icon="info-sign"
                        onPress={() => {
                            setIsAboutDialogOpen(true);
                            return true;
                        }}
                    />
                    <Button
                        id="pb-settings-tour-button"
                        label={i18n.translate('app.tour.label')}
                        icon="info-sign"
                        onPress={() => {
                            dispatch(tourStart());
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
