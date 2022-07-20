// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './installPybricksDialog.scss';
import {
    Button,
    Checkbox,
    Classes,
    ControlGroup,
    DialogStep,
    FormGroup,
    IRef,
    Icon,
    InputGroup,
    Intent,
    MultistepDialog,
    NonIdealState,
    Spinner,
    Switch,
} from '@blueprintjs/core';
import { Classes as Classes2, Popover2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { appName } from '../../app/constants';
import HelpButton from '../../components/HelpButton';
import {
    Hub,
    hubHasBluetoothButton,
    hubHasExternalFlash,
    hubHasUSB,
} from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useSelector } from '../../reducers';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
} from './actions';
import { useFirmware } from './hooks';
import { I18nId, useI18n } from './i18n';
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
            <p>{i18n.translate(I18nId.SelectHubPanelMessage)}</p>
            <HubPicker hubType={hubType} onChange={onChange} />
            <Popover2
                popoverClassName={Classes2.POPOVER2_CONTENT_SIZING}
                placement="right-end"
                content={
                    <div>
                        <h3>
                            {i18n.translate(
                                I18nId.SelectHubPanelNotOnListButtonInfoMindstormsTitle,
                            )}
                        </h3>
                        <ul>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoMindstormsRcx,
                                )}
                            </li>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoMindstormsNxt,
                                )}
                            </li>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoMindstormsEv3,
                                )}
                            </li>
                        </ul>
                        <h3>
                            {i18n.translate(
                                I18nId.SelectHubPanelNotOnListButtonInfoPoweredUpTitle,
                            )}
                        </h3>
                        <ul>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoPoweredUpWedo2,
                                )}
                                <em>*</em>
                            </li>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoPoweredUpDuploTrain,
                                )}
                                <em>*</em>
                            </li>
                            <li>
                                {i18n.translate(
                                    I18nId.SelectHubPanelNotOnListButtonInfoPoweredUpMario,
                                )}
                            </li>
                        </ul>

                        <em>
                            *{' '}
                            {i18n.translate(
                                I18nId.SelectHubPanelNotOnListButtonInfoPoweredUpFootnote,
                            )}
                        </em>
                    </div>
                }
                renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
                    <Button
                        elementRef={ref as IRef<HTMLButtonElement>}
                        {...targetProps}
                    >
                        {i18n.translate(I18nId.SelectHubPanelNotOnListButtonLabel)}
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
                    {data && <pre>{data.licenseText}</pre>}
                    {!data && (
                        <NonIdealState>
                            {(error &&
                                i18n.translate(
                                    I18nId.LicensePanelLicenseTextError,
                                )) || <Spinner />}
                        </NonIdealState>
                    )}
                </div>
                <Checkbox
                    label={i18n.translate(I18nId.LicensePanelAcceptCheckboxLabel)}
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
    onChangeHubName(hubName: string): void;
    onChangeIncludeProgram(includeProgram: boolean): void;
};

const ConfigureOptionsPanel: React.VoidFunctionComponent<SelectOptionsPanelProps> = ({
    hubType,
    hubName,
    includeProgram,
    onChangeHubName,
    onChangeIncludeProgram,
}) => {
    const i18n = useI18n();
    const isHubNameValid = validateHubName(hubName);

    return (
        <div className={dialogBody}>
            <FormGroup
                label={i18n.translate(I18nId.OptionsPanelHubNameLabel)}
                labelInfo={i18n.translate(I18nId.OptionsPanelHubNameLabelInfo)}
            >
                <ControlGroup>
                    <InputGroup
                        id="hub-name-input"
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
                        helpForLabel={i18n.translate(I18nId.OptionsPanelHubNameLabel)}
                        content={i18n.translate(I18nId.OptionsPanelHubNameHelp)}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup
                label={i18n.translate(I18nId.OptionsPanelCustomMainLabel)}
                labelInfo={i18n.translate(I18nId.OptionsPanelCustomMainLabelInfo)}
            >
                {(hubHasExternalFlash(hubType) && (
                    <p>
                        {i18n.translate(
                            I18nId.OptionsPanelCustomMainNotApplicableMessage,
                        )}
                    </p>
                )) || (
                    <ControlGroup>
                        <Switch
                            label={i18n.translate(
                                I18nId.OptionsPanelCustomMainIncludeCurrentProgramLabel,
                            )}
                            checked={includeProgram}
                            onChange={(e) =>
                                onChangeIncludeProgram(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <HelpButton
                            helpForLabel={i18n.translate(
                                I18nId.OptionsPanelCustomMainIncludeCurrentProgramLabel,
                            )}
                            content={i18n.translate(
                                I18nId.OptionsPanelCustomMainIncludeCurrentProgramHelp,
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
                    ? I18nId.BootloaderPanelButtonBluetooth
                    : I18nId.BootloaderPanelButtonPower,
            ),
            light: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? I18nId.BootloaderPanelLightBluetooth
                    : I18nId.BootloaderPanelLightStatus,
            ),
            lightPattern: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? I18nId.BootloaderPanelLightPatternBluetooth
                    : I18nId.BootloaderPanelLightPatternStatus,
            ),
        };
    }, [i18n, hubType]);

    return (
        <div className={dialogBody}>
            <p>{i18n.translate(I18nId.BootloaderPanelInstruction1)}</p>
            <ol>
                {hubHasUSB(hubType) && (
                    <li>{i18n.translate(I18nId.BootloaderPanelStepDisconnectUsb)}</li>
                )}

                <li>{i18n.translate(I18nId.BootloaderPanelStepPowerOff)}</li>

                {/* City hub has power issues and requires disconnecting motors/sensors */}
                {hubType === Hub.City && (
                    <li>{i18n.translate(I18nId.BootloaderPanelStepDisconnectIo)}</li>
                )}

                <li>
                    {i18n.translate(I18nId.BootloaderPanelStepHoldButton, { button })}
                </li>

                {hubHasUSB(hubType) && (
                    <li>{i18n.translate(I18nId.BootloaderPanelStepConnectUsb)}</li>
                )}

                <li>
                    {i18n.translate(I18nId.BootloaderPanelStepWaitForLight, {
                        button,
                        light,
                        lightPattern,
                    })}
                </li>

                <li>
                    {i18n.translate(
                        /* hubs with USB will keep the power on, but other hubs won't */
                        hubHasUSB(hubType)
                            ? I18nId.BootloaderPanelStepReleaseButton
                            : I18nId.BootloaderPanelStepKeepHolding,
                        {
                            button,
                        },
                    )}
                </li>
            </ol>
            <p>
                {i18n.translate(I18nId.BootloaderPanelInstruction2, {
                    flashFirmware: (
                        <strong>
                            {i18n.translate(I18nId.FlashFirmwareButtonLabel)}
                        </strong>
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
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    const { data } = useFirmware(hubType);
    const i18n = useI18n();

    return (
        <MultistepDialog
            title={i18n.translate(I18nId.Title)}
            isOpen={isOpen}
            onClose={() => dispatch(firmwareInstallPybricksDialogCancel())}
            finalButtonProps={{
                text: i18n.translate(I18nId.FlashFirmwareButtonLabel),
                onClick: () =>
                    dispatch(
                        firmwareInstallPybricksDialogAccept(
                            data?.firmwareZip ?? new ArrayBuffer(0),
                            undefined,
                            hubName,
                        ),
                    ),
            }}
        >
            <DialogStep
                id="hub"
                title={i18n.translate(I18nId.SelectHubPanelTitle)}
                panel={<SelectHubPanel hubType={hubType} onChange={setHubType} />}
                nextButtonProps={{ text: i18n.translate(I18nId.NextButtonLabel) }}
            />
            <DialogStep
                id="license"
                title={i18n.translate(I18nId.LicensePanelTitle)}
                panel={
                    <AcceptLicensePanel
                        hubType={hubType}
                        licenseAccepted={licenseAccepted}
                        onLicenseAcceptedChanged={setLicenseAccepted}
                    />
                }
                backButtonProps={{ text: i18n.translate(I18nId.BackButtonLabel) }}
                nextButtonProps={{
                    disabled: !licenseAccepted,
                    text: i18n.translate(I18nId.NextButtonLabel),
                }}
            />
            <DialogStep
                id="options"
                title={i18n.translate(I18nId.OptionsPanelTitle)}
                panel={
                    <ConfigureOptionsPanel
                        hubType={hubType}
                        hubName={hubName}
                        includeProgram={includeProgram}
                        onChangeHubName={setHubName}
                        onChangeIncludeProgram={setIncludeProgram}
                    />
                }
                backButtonProps={{ text: i18n.translate(I18nId.BackButtonLabel) }}
                nextButtonProps={{ text: i18n.translate(I18nId.NextButtonLabel) }}
            />
            <DialogStep
                id="bootloader"
                title={i18n.translate(I18nId.BootloaderPanelTitle)}
                panel={<BootloaderModePanel hubType={hubType} />}
                backButtonProps={{ text: i18n.translate(I18nId.BackButtonLabel) }}
            />
        </MultistepDialog>
    );
};
