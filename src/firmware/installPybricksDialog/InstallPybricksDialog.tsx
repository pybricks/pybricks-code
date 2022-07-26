// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './installPybricksDialog.scss';
import {
    Button,
    Callout,
    Checkbox,
    Classes,
    ControlGroup,
    DialogStep,
    FormGroup,
    IRef,
    Icon,
    InputGroup,
    Intent,
    MenuItem,
    MultistepDialog,
    NonIdealState,
    Spinner,
    Switch,
} from '@blueprintjs/core';
import { Classes as Classes2, Popover2 } from '@blueprintjs/popover2';
import { Select2 } from '@blueprintjs/select';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    appName,
    pybricksUsbDfuWindowsDriverInstallUrl,
    pybricksUsbLinuxUdevRulesUrl,
} from '../../app/constants';
import HelpButton from '../../components/HelpButton';
import {
    Hub,
    hubBootloaderType,
    hubHasBluetoothButton,
    hubHasExternalFlash,
    hubHasUSB,
} from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { FileMetadata } from '../../fileStorage';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import { useSelector } from '../../reducers';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { isLinux, isWindows } from '../../utils/os';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
} from './actions';
import { useFirmware } from './hooks';
import { useI18n } from './i18n';
import { validateHubName } from '.';

const dialogBody = classNames(
    Classes.DIALOG_BODY,
    'pb-firmware-installPybricksDialog-body',
);

type SelectHubPanelProps = {
    hubType: Hub;
    onChange: (hubType: Hub) => void;
};

const SelectHubPanel: React.VoidFunctionComponent<SelectHubPanelProps> = ({
    hubType,
    onChange,
}) => {
    const i18n = useI18n();

    return (
        <div className={dialogBody}>
            <p>{i18n.translate('selectHubPanel.message')}</p>
            <HubPicker hubType={hubType} onChange={onChange} />
            <Popover2
                popoverClassName={Classes2.POPOVER2_CONTENT_SIZING}
                placement="right-end"
                content={
                    <div>
                        <h3>
                            {i18n.translate(
                                'selectHubPanel.notOnListButton.info.mindstorms.title',
                            )}
                        </h3>
                        <ul>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.mindstorms.rcx',
                                )}
                            </li>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.mindstorms.nxt',
                                )}
                            </li>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.mindstorms.ev3',
                                )}
                            </li>
                        </ul>
                        <h3>
                            {i18n.translate(
                                'selectHubPanel.notOnListButton.info.poweredUp.title',
                            )}
                        </h3>
                        <ul>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.poweredUp.wedo2',
                                )}
                                <em>*</em>
                            </li>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.poweredUp.duploTrain',
                                )}
                                <em>*</em>
                            </li>
                            <li>
                                {i18n.translate(
                                    'selectHubPanel.notOnListButton.info.poweredUp.mario',
                                )}
                            </li>
                        </ul>

                        <em>
                            *{' '}
                            {i18n.translate(
                                'selectHubPanel.notOnListButton.info.poweredUp.footnote',
                            )}
                        </em>
                    </div>
                }
                renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
                    <Button
                        elementRef={ref as IRef<HTMLButtonElement>}
                        {...targetProps}
                    >
                        {i18n.translate('selectHubPanel.notOnListButton.label')}
                    </Button>
                )}
            />
        </div>
    );
};

type AcceptLicensePanelProps = {
    hubType: Hub;
    licenseAccepted: boolean;
    onLicenseAcceptedChanged: (accepted: boolean) => void;
};

const AcceptLicensePanel: React.VoidFunctionComponent<AcceptLicensePanelProps> = ({
    hubType,
    licenseAccepted,
    onLicenseAcceptedChanged,
}) => {
    const { data, error } = useFirmware(hubType);
    const i18n = useI18n();

    return (
        <div className={dialogBody}>
            <div className="pb-firmware-installPybricksDialog-license">
                <div className="pb-firmware-installPybricksDialog-license-text">
                    {data ? (
                        <pre>{data.licenseText}</pre>
                    ) : (
                        <NonIdealState
                            icon={error ? 'error' : <Spinner />}
                            description={
                                error
                                    ? i18n.translate('licensePanel.licenseText.error')
                                    : undefined
                            }
                        />
                    )}
                </div>
                <Checkbox
                    label={i18n.translate('licensePanel.acceptCheckbox.label')}
                    checked={licenseAccepted}
                    onChange={(e) => onLicenseAcceptedChanged(e.currentTarget.checked)}
                    disabled={!data}
                />
            </div>
        </div>
    );
};

type SelectOptionsPanelProps = {
    hubType: Hub;
    hubName: string;
    includeProgram: boolean;
    selectedIncludeFile: FileMetadata | undefined;
    onChangeHubName(hubName: string): void;
    onChangeIncludeProgram(includeProgram: boolean): void;
    onChangeSelectedIncludeFile(selectedIncludeFile: FileMetadata | undefined): void;
};

const ConfigureOptionsPanel: React.VoidFunctionComponent<SelectOptionsPanelProps> = ({
    hubType,
    hubName,
    includeProgram,
    selectedIncludeFile,
    onChangeHubName,
    onChangeIncludeProgram,
    onChangeSelectedIncludeFile,
}) => {
    const i18n = useI18n();
    const isHubNameValid = validateHubName(hubName);
    const files = useFileStorageMetadata();

    return (
        <div className={dialogBody}>
            <FormGroup
                label={i18n.translate('optionsPanel.hubName.label')}
                labelInfo={i18n.translate('optionsPanel.hubName.labelInfo')}
            >
                <ControlGroup>
                    <InputGroup
                        value={hubName}
                        onChange={(e) => onChangeHubName(e.currentTarget.value)}
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
                        helpForLabel={i18n.translate('optionsPanel.hubName.label')}
                        content={i18n.translate('optionsPanel.hubName.help')}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup
                label={i18n.translate('optionsPanel.customMain.label')}
                labelInfo={i18n.translate('optionsPanel.customMain.labelInfo')}
            >
                {(hubHasExternalFlash(hubType) && (
                    <p>
                        {i18n.translate(
                            'optionsPanel.customMain.notApplicable.message',
                        )}
                    </p>
                )) || (
                    <ControlGroup>
                        <Switch
                            labelElement={i18n.translate(
                                'optionsPanel.customMain.include.label',
                                { main: <code>main.py</code> },
                            )}
                            checked={includeProgram}
                            onChange={(e) =>
                                onChangeIncludeProgram(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <Select2
                            items={files || []}
                            itemRenderer={(
                                item,
                                { handleClick, handleFocus, modifiers },
                            ) => (
                                <MenuItem
                                    roleStructure="listoption"
                                    active={modifiers.active}
                                    disabled={modifiers.disabled}
                                    text={item.path}
                                    key={item.uuid}
                                    onClick={handleClick}
                                    onFocus={handleFocus}
                                />
                            )}
                            noResults={
                                <MenuItem
                                    roleStructure="listoption"
                                    disabled={true}
                                    text={i18n.translate(
                                        'optionsPanel.customMain.include.noFiles',
                                    )}
                                />
                            }
                            filterable={false}
                            popoverProps={{ minimal: true }}
                            disabled={!includeProgram}
                            onItemSelect={onChangeSelectedIncludeFile}
                        >
                            <Button
                                icon="double-caret-vertical"
                                text={
                                    selectedIncludeFile?.path ??
                                    i18n.translate(
                                        'optionsPanel.customMain.include.noSelection',
                                    )
                                }
                                disabled={!includeProgram}
                            />
                        </Select2>
                        <HelpButton
                            helpForLabel={i18n.translate(
                                'optionsPanel.customMain.include.label',
                                { main: 'main.py' },
                            )}
                            content={i18n.translate(
                                'optionsPanel.customMain.include.help',
                                {
                                    appName,
                                },
                            )}
                        />
                    </ControlGroup>
                )}
            </FormGroup>
        </div>
    );
};

type BootloaderModePanelProps = {
    hubType: Hub;
};

const BootloaderModePanel: React.VoidFunctionComponent<BootloaderModePanelProps> = ({
    hubType,
}) => {
    const i18n = useI18n();

    const { button, light, lightPattern } = useMemo(() => {
        return {
            button: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? 'bootloaderPanel.button.bluetooth'
                    : 'bootloaderPanel.button.power',
            ),
            light: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? 'bootloaderPanel.light.bluetooth'
                    : 'bootloaderPanel.light.status',
            ),
            lightPattern: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? 'bootloaderPanel.lightPattern.bluetooth'
                    : 'bootloaderPanel.lightPattern.status',
            ),
        };
    }, [i18n, hubType]);

    return (
        <div className={dialogBody}>
            {hubHasUSB(hubType) && isLinux() && (
                <p>
                    <Callout intent={Intent.WARNING} icon="warning-sign">
                        {i18n.translate('bootloaderPanel.warning.linux')}{' '}
                        <a
                            href={pybricksUsbLinuxUdevRulesUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {i18n.translate('bootloaderPanel.warning.learnMore')}
                        </a>
                        <ExternalLinkIcon />
                    </Callout>
                </p>
            )}
            {hubHasUSB(hubType) && isWindows() && (
                <p>
                    <Callout intent={Intent.WARNING} icon="warning-sign">
                        {i18n.translate('bootloaderPanel.warning.windows')}{' '}
                        <a
                            href={pybricksUsbDfuWindowsDriverInstallUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {i18n.translate('bootloaderPanel.warning.learnMore')}
                        </a>
                        <ExternalLinkIcon />
                    </Callout>
                </p>
            )}

            <p>{i18n.translate('bootloaderPanel.instruction1')}</p>
            <ol>
                {hubHasUSB(hubType) && (
                    <li>{i18n.translate('bootloaderPanel.step.disconnectUsb')}</li>
                )}

                <li>{i18n.translate('bootloaderPanel.step.powerOff')}</li>

                {/* City hub has power issues and requires disconnecting motors/sensors */}
                {hubType === Hub.City && (
                    <li>{i18n.translate('bootloaderPanel.step.disconnectIo')}</li>
                )}

                <li>{i18n.translate('bootloaderPanel.step.holdButton', { button })}</li>

                {hubHasUSB(hubType) && (
                    <li>{i18n.translate('bootloaderPanel.step.connectUsb')}</li>
                )}

                <li>
                    {i18n.translate('bootloaderPanel.step.waitForLight', {
                        button,
                        light,
                        lightPattern,
                    })}
                </li>

                <li>
                    {i18n.translate(
                        /* hubs with USB will keep the power on, but other hubs won't */
                        hubHasUSB(hubType)
                            ? 'bootloaderPanel.step.releaseButton'
                            : 'bootloaderPanel.step.keepHolding',
                        {
                            button,
                        },
                    )}
                </li>
            </ol>
            <p>
                {i18n.translate('bootloaderPanel.instruction2', {
                    flashFirmware: (
                        <strong>{i18n.translate('flashFirmwareButton.label')}</strong>
                    ),
                })}
            </p>
        </div>
    );
};

const defaultHubType = Hub.Technic;

export const InstallPybricksDialog: React.VoidFunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.installPybricksDialog);
    const dispatch = useDispatch();
    const [hubType, setHubType] = useState(defaultHubType);
    const [hubName, setHubName] = useState('');
    const [includeProgram, setIncludeProgram] = useState(false);
    const [selectedIncludeFile, setSelectedIncludeFile] = useState<FileMetadata>();
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    const { data } = useFirmware(hubType);
    const i18n = useI18n();

    return (
        <MultistepDialog
            title={i18n.translate('title')}
            isOpen={isOpen}
            onClose={() => dispatch(firmwareInstallPybricksDialogCancel())}
            finalButtonProps={{
                text: i18n.translate('flashFirmwareButton.label'),
                onClick: () =>
                    dispatch(
                        firmwareInstallPybricksDialogAccept(
                            hubBootloaderType(hubType),
                            data?.firmwareZip ?? new ArrayBuffer(0),
                            selectedIncludeFile?.path,
                            hubName,
                        ),
                    ),
            }}
        >
            <DialogStep
                id="hub"
                title={i18n.translate('selectHubPanel.title')}
                panel={<SelectHubPanel hubType={hubType} onChange={setHubType} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="license"
                title={i18n.translate('licensePanel.title')}
                panel={
                    <AcceptLicensePanel
                        hubType={hubType}
                        licenseAccepted={licenseAccepted}
                        onLicenseAcceptedChanged={setLicenseAccepted}
                    />
                }
                backButtonProps={{ text: i18n.translate('backButton.label') }}
                nextButtonProps={{
                    disabled: !licenseAccepted,
                    text: i18n.translate('nextButton.label'),
                }}
            />
            <DialogStep
                id="options"
                title={i18n.translate('optionsPanel.title')}
                panel={
                    <ConfigureOptionsPanel
                        hubType={hubType}
                        hubName={hubName}
                        includeProgram={includeProgram}
                        selectedIncludeFile={selectedIncludeFile}
                        onChangeHubName={setHubName}
                        onChangeIncludeProgram={setIncludeProgram}
                        onChangeSelectedIncludeFile={setSelectedIncludeFile}
                    />
                }
                backButtonProps={{ text: i18n.translate('backButton.label') }}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="bootloader"
                title={i18n.translate('bootloaderPanel.title')}
                panel={<BootloaderModePanel hubType={hubType} />}
                backButtonProps={{ text: i18n.translate('backButton.label') }}
            />
        </MultistepDialog>
    );
};
