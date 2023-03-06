// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './installPybricksDialog.scss';
import {
    Button,
    Checkbox,
    Classes,
    Collapse,
    ControlGroup,
    DialogStep,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    MultistepDialog,
    NonIdealState,
    Pre,
    Spinner,
} from '@blueprintjs/core';
import { Classes as Classes2, Popover2 } from '@blueprintjs/popover2';
import { FirmwareMetadata, HubType } from '@pybricks/firmware';
import { fileOpen } from 'browser-fs-access';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { VisuallyHidden } from 'react-aria';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import { alertsShowAlert } from '../../alerts/actions';
import {
    appName,
    legoMindstormsRegisteredTrademark,
    zipFileExtension,
    zipFileMimeType,
} from '../../app/constants';
import HelpButton from '../../components/HelpButton';
import { Hub, hubBootloaderType } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import { ensureError } from '../../utils';
import BootloaderInstructions from '../bootloaderInstructions/BootloaderInstructions';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
} from './actions';
import { FirmwareData, useCustomFirmware, useFirmware } from './hooks';
import { useI18n } from './i18n';
import { validateHubName } from '.';

const dialogBody = classNames(
    Classes.DIALOG_BODY,
    Classes.RUNNING_TEXT,
    'pb-firmware-installPybricksDialog-body',
);

/** Translates hub type from firmware metadata to local hub type. */
function getHubTypeFromMetadata(
    metadata: FirmwareMetadata | undefined,
    fallback: Hub,
): Hub {
    switch (metadata?.['device-id']) {
        case HubType.MoveHub:
            return Hub.Move;
        case HubType.CityHub:
            return Hub.City;
        case HubType.TechnicHub:
            return Hub.Technic;
        case HubType.PrimeHub:
            return Hub.Prime;
        case HubType.EssentialHub:
            return Hub.Essential;
        default:
            return fallback;
    }
}

function getHubTypeNameFromMetadata(metadata: FirmwareMetadata | undefined): string {
    switch (metadata?.['device-id']) {
        case HubType.MoveHub:
            return 'BOOST Move Hub';
        case HubType.CityHub:
            return 'City Hub';
        case HubType.TechnicHub:
            return 'Technic Hub';
        case HubType.PrimeHub:
            return 'SPIKE Prime/MINDSTORMS Robot Inventor hub';
        case HubType.EssentialHub:
            return 'SPIKE Essential hub';
        default:
            return '?';
    }
}

const UnsupportedHubs: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

    return (
        <div className={Classes.RUNNING_TEXT}>
            <h4>
                {i18n.translate(
                    'selectHubPanel.notOnListButton.info.mindstorms.title',
                    { legoMindstormsRegisteredTrademark },
                )}
            </h4>
            <p>
                {i18n.translate(
                    'selectHubPanel.notOnListButton.info.mindstorms.intro',
                    {
                        appName,
                        legoMindstormsRegisteredTrademark,
                    },
                )}
            </p>
            <p>
                {i18n.translate(
                    'selectHubPanel.notOnListButton.info.mindstorms.help.message',
                    {
                        sponsor: (
                            <>
                                <VisuallyHidden elementType="span">
                                    {i18n.translate(
                                        'selectHubPanel.notOnListButton.info.mindstorms.help.sponsor',
                                    )}
                                </VisuallyHidden>
                                <Icon icon="heart" />
                            </>
                        ),
                    },
                )}
            </p>
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
            <h4>
                {i18n.translate('selectHubPanel.notOnListButton.info.poweredUp.title')}
            </h4>
            <p>
                {i18n.translate('selectHubPanel.notOnListButton.info.poweredUp.intro')}
            </p>
            <ul>
                <li>
                    {i18n.translate(
                        'selectHubPanel.notOnListButton.info.poweredUp.wedo2',
                    )}
                </li>
                <li>
                    {i18n.translate(
                        'selectHubPanel.notOnListButton.info.poweredUp.duploTrain',
                    )}
                </li>
                <li>
                    {i18n.translate(
                        'selectHubPanel.notOnListButton.info.poweredUp.mario',
                    )}
                </li>
            </ul>
        </div>
    );
};

type SelectHubPanelProps = {
    isCustomFirmwareRequested: boolean;
    customFirmwareData: FirmwareData | undefined;
    onCustomFirmwareZip: (firmwareZip: File | undefined) => void;
};

const SelectHubPanel: React.VoidFunctionComponent<SelectHubPanelProps> = ({
    isCustomFirmwareRequested,
    customFirmwareData,
    onCustomFirmwareZip,
}) => {
    const [isAdvancedOpen, setIsAdvancedOpen] = useLocalStorage(
        'installPybricksDialog.isAdvancedOpen',
        false,
    );
    const i18n = useI18n();
    const dispatch = useDispatch();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // should only be one file since multiple={false}
            acceptedFiles.forEach((f) => {
                onCustomFirmwareZip(f);
            });
        },
        [onCustomFirmwareZip],
    );

    const onClick = useCallback(async () => {
        try {
            const file = await fileOpen({
                id: 'customFirmware',
                mimeTypes: [zipFileMimeType],
                extensions: [zipFileExtension],
                // TODO: translate description
                description: 'Zip Files',
                excludeAcceptAllOption: true,
                startIn: 'downloads',
            });

            onCustomFirmwareZip(file);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                // user cancelled, nothing to do
            } else {
                dispatch(
                    alertsShowAlert('alerts', 'unexpectedError', {
                        error: ensureError(err),
                    }),
                );
            }
        }
    }, [dispatch, onCustomFirmwareZip]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== 'Enter' && e.key !== ' ') {
                return;
            }

            e.stopPropagation();
            onClick();
        },
        [onClick],
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept: { [zipFileMimeType]: [zipFileExtension] },
        multiple: false,
        // react-dropzone doesn't allow full control of File System API, so we
        // implement our own using browser-fs-access instead.
        noClick: true,
        onDrop,
    });

    return (
        <div className={dialogBody}>
            {isCustomFirmwareRequested ? (
                <>
                    <p>{i18n.translate('selectHubPanel.customFirmware.message')}</p>
                    <p>
                        {i18n.translate('selectHubPanel.customFirmware.hubType', {
                            hubTypeName: getHubTypeNameFromMetadata(
                                customFirmwareData?.metadata,
                            ),
                        })}
                    </p>
                    <p>
                        {i18n.translate(
                            'selectHubPanel.customFirmware.firmwareVersion',
                            {
                                version:
                                    customFirmwareData?.metadata['firmware-version'],
                            },
                        )}
                    </p>
                    <Button
                        onClick={() => {
                            onCustomFirmwareZip(undefined);
                        }}
                    >
                        {i18n.translate('selectHubPanel.customFirmware.clearButton')}
                    </Button>
                </>
            ) : (
                <>
                    <p>{i18n.translate('selectHubPanel.message')}</p>
                    <HubPicker />
                    <Popover2
                        popoverClassName={Classes2.POPOVER2_CONTENT_SIZING}
                        placement="right-end"
                        content={<UnsupportedHubs />}
                        renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
                            <Button
                                elementRef={ref as React.Ref<HTMLButtonElement>}
                                {...targetProps}
                            >
                                {i18n.translate('selectHubPanel.notOnListButton.label')}
                            </Button>
                        )}
                    />
                </>
            )}
            <div className="pb-firmware-installPybricksDialog-selectHub-advanced">
                <Button
                    minimal={true}
                    small={true}
                    icon={isAdvancedOpen ? 'chevron-down' : 'chevron-right'}
                    onClick={() => setIsAdvancedOpen((v) => !v)}
                >
                    {i18n.translate('selectHubPanel.advanced.label')}
                </Button>
                <Collapse isOpen={isAdvancedOpen}>
                    <div
                        {...getRootProps({
                            className: 'pb-dropzone-root',
                            onClick,
                            onKeyDown,
                        })}
                    >
                        <input {...getInputProps()} />
                        {i18n.translate(
                            'selectHubPanel.advanced.customFirmwareDropzone.label',
                        )}
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

type AcceptLicensePanelProps = {
    licenseAccepted: boolean;
    firmwareData: FirmwareData | undefined;
    firmwareError: Error | undefined;
    isCustomFirmwareRequested: boolean;
    customFirmwareData: FirmwareData | undefined;
    customFirmwareError: Error | undefined;
    onLicenseAcceptedChanged: (accepted: boolean) => void;
};

const AcceptLicensePanel: React.VoidFunctionComponent<AcceptLicensePanelProps> = ({
    licenseAccepted,
    firmwareData,
    firmwareError,
    isCustomFirmwareRequested,
    customFirmwareData,
    customFirmwareError,
    onLicenseAcceptedChanged,
}) => {
    const i18n = useI18n();

    const selectedFirmwareData = isCustomFirmwareRequested
        ? customFirmwareData
        : firmwareData;
    const selectedFirmwareError = isCustomFirmwareRequested
        ? customFirmwareError
        : firmwareError;

    return (
        <div className={dialogBody}>
            <div className="pb-firmware-installPybricksDialog-license-text">
                {selectedFirmwareData ? (
                    <Pre>{selectedFirmwareData.licenseText}</Pre>
                ) : (
                    <NonIdealState
                        icon={selectedFirmwareError ? 'error' : <Spinner />}
                        description={
                            selectedFirmwareError
                                ? i18n.translate('licensePanel.licenseText.error')
                                : undefined
                        }
                    />
                )}
            </div>
            <Checkbox
                className="pb-firmware-installPybricksDialog-license-checkbox"
                label={i18n.translate('licensePanel.acceptCheckbox.label')}
                checked={licenseAccepted}
                onChange={(e) => onLicenseAcceptedChanged(e.currentTarget.checked)}
                disabled={!selectedFirmwareData}
            />
        </div>
    );
};

type SelectOptionsPanelProps = {
    hubName: string;
    metadata: FirmwareMetadata | undefined;
    onChangeHubName(hubName: string): void;
};

const ConfigureOptionsPanel: React.VoidFunctionComponent<SelectOptionsPanelProps> = ({
    hubName,
    metadata,
    onChangeHubName,
}) => {
    const i18n = useI18n();
    const isHubNameValid = metadata ? validateHubName(hubName, metadata) : true;

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
                                    tagName="div"
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

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <BootloaderInstructions
                hubType={hubType}
                flashButtonText={i18n.translate('flashFirmwareButton.label')}
            />
        </div>
    );
};

export const InstallPybricksDialog: React.VoidFunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.installPybricksDialog);
    const dispatch = useDispatch();
    const [hubName, setHubName] = useState('');
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    const [hubType] = useHubPickerSelectedHub();
    const { firmwareData, firmwareError } = useFirmware(hubType);
    const [customFirmwareZip, setCustomFirmwareZip] = useState<File>();
    const { isCustomFirmwareRequested, customFirmwareData, customFirmwareError } =
        useCustomFirmware(customFirmwareZip);
    const i18n = useI18n();

    const selectedFirmwareData = isCustomFirmwareRequested
        ? customFirmwareData
        : firmwareData;
    const selectedHubType = isCustomFirmwareRequested
        ? getHubTypeFromMetadata(customFirmwareData?.metadata, hubType)
        : hubType;

    return (
        <MultistepDialog
            title={i18n.translate('title')}
            isOpen={isOpen}
            onClose={() => dispatch(firmwareInstallPybricksDialogCancel())}
            backButtonProps={{ text: i18n.translate('backButton.label') }}
            nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            finalButtonProps={{
                text: i18n.translate('flashFirmwareButton.label'),
                onClick: () =>
                    dispatch(
                        firmwareInstallPybricksDialogAccept(
                            hubBootloaderType(selectedHubType),
                            selectedFirmwareData?.firmwareZip ?? new ArrayBuffer(0),
                            hubName,
                        ),
                    ),
            }}
        >
            <DialogStep
                id="hub"
                title={i18n.translate('selectHubPanel.title')}
                panel={
                    <SelectHubPanel
                        isCustomFirmwareRequested={isCustomFirmwareRequested}
                        customFirmwareData={customFirmwareData}
                        onCustomFirmwareZip={setCustomFirmwareZip}
                    />
                }
            />
            <DialogStep
                id="license"
                title={i18n.translate('licensePanel.title')}
                panel={
                    <AcceptLicensePanel
                        licenseAccepted={licenseAccepted}
                        firmwareData={firmwareData}
                        firmwareError={firmwareError}
                        isCustomFirmwareRequested={isCustomFirmwareRequested}
                        customFirmwareData={customFirmwareData}
                        customFirmwareError={customFirmwareError}
                        onLicenseAcceptedChanged={setLicenseAccepted}
                    />
                }
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
                        hubName={hubName}
                        metadata={
                            isCustomFirmwareRequested
                                ? customFirmwareData?.metadata
                                : firmwareData?.metadata
                        }
                        onChangeHubName={setHubName}
                    />
                }
            />
            <DialogStep
                id="bootloader"
                title={i18n.translate('bootloaderPanel.title')}
                panel={<BootloaderModePanel hubType={selectedHubType} />}
            />
        </MultistepDialog>
    );
};
