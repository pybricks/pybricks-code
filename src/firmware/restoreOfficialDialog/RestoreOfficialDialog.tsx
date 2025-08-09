// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2025 The Pybricks Authors

import {
    Button,
    Classes,
    DialogStep,
    Intent,
    MultistepDialog,
    Radio,
    RadioGroup,
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import {
    legoEducationSpikeRegisteredTrademark,
    legoMindstormsRegisteredTrademark,
    legoRegisteredTrademark,
} from '../../app/constants';
import { Hub, hubHasUSB } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import {
    EV3OfficialFirmwareVersion,
    firmwareRestoreOfficialDfu,
    firmwareRestoreOfficialEV3,
} from '../actions';
import BootloaderInstructions from '../bootloaderInstructions/BootloaderInstructions';
import { firmwareRestoreOfficialDialogHide } from './actions';
import { useI18n } from './i18n';

const SelectHubPanel: React.FunctionComponent = () => {
    const i18n = useI18n();

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <p>
                {i18n.translate('selectHubPanel.message', {
                    lego: legoRegisteredTrademark,
                    next: <strong>{i18n.translate('nextButton.label')}</strong>,
                })}
            </p>
            <div className="pb-spacer" />
            <HubPicker />
        </div>
    );
};

const RestoreFirmwarePanel: React.FunctionComponent = () => {
    const [hubType] = useHubPickerSelectedHub();
    const dispatch = useDispatch();
    const i18n = useI18n();
    const inProgress = useSelector(
        (s) =>
            s.firmware.isFirmwareFlashUsbDfuInProgress ||
            s.firmware.isFirmwareRestoreOfficialDfuInProgress,
    );
    const [ev3OfficialFirmwareVersion, setEv3OfficialFirmwareVersion] =
        useLocalStorage<EV3OfficialFirmwareVersion>(
            'ev3OfficialFirmwareVersion',
            EV3OfficialFirmwareVersion.home,
        );

    const handleRestoreDfuButtonClick = useCallback(() => {
        dispatch(firmwareRestoreOfficialDfu(hubType));
    }, [dispatch, hubType]);

    const handleRestoreEV3ButtonClick = useCallback(() => {
        dispatch(firmwareRestoreOfficialEV3(ev3OfficialFirmwareVersion));
    }, [dispatch, ev3OfficialFirmwareVersion]);

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <BootloaderInstructions
                hubType={hubType}
                recovery
                flashButtonText={i18n.translate('restoreFirmwarePanel.flashButton')}
            />
            {hubType === Hub.EV3 ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        height: '100%',
                    }}
                >
                    <Button
                        intent={Intent.PRIMARY}
                        disabled={inProgress}
                        onClick={handleRestoreEV3ButtonClick}
                    >
                        {i18n.translate('restoreFirmwarePanel.flashButton')}
                    </Button>
                    <RadioGroup
                        selectedValue={ev3OfficialFirmwareVersion}
                        onChange={(event) =>
                            setEv3OfficialFirmwareVersion(
                                event.currentTarget.value as EV3OfficialFirmwareVersion,
                            )
                        }
                    >
                        <Radio
                            value={EV3OfficialFirmwareVersion.home}
                            checked={
                                ev3OfficialFirmwareVersion ===
                                EV3OfficialFirmwareVersion.home
                            }
                        >
                            {i18n.translate(
                                'restoreFirmwarePanel.ev3FirmwareType.home',
                            )}
                        </Radio>
                        <Radio
                            value={EV3OfficialFirmwareVersion.education}
                            checked={
                                ev3OfficialFirmwareVersion ===
                                EV3OfficialFirmwareVersion.education
                            }
                        >
                            {i18n.translate(
                                'restoreFirmwarePanel.ev3FirmwareType.education',
                            )}
                        </Radio>
                        <Radio
                            value={EV3OfficialFirmwareVersion.makecode}
                            checked={
                                ev3OfficialFirmwareVersion ===
                                EV3OfficialFirmwareVersion.makecode
                            }
                        >
                            {i18n.translate(
                                'restoreFirmwarePanel.ev3FirmwareType.makecode',
                            )}
                        </Radio>
                    </RadioGroup>
                </div>
            ) : (
                <>
                    {hubHasUSB(hubType) ? (
                        <>
                            <p>
                                {i18n.translate(
                                    'restoreFirmwarePanel.instruction2.updateApp',
                                    {
                                        app:
                                            hubType === Hub.Inventor
                                                ? legoMindstormsRegisteredTrademark
                                                : legoEducationSpikeRegisteredTrademark,
                                    },
                                )}{' '}
                                {hubType !== Hub.Inventor
                                    ? i18n.translate(
                                          'restoreFirmwarePanel.instruction2.updateAppVersion',
                                      )
                                    : ''}
                            </p>
                            <div className="pb-spacer" />
                            <Button
                                intent={Intent.PRIMARY}
                                disabled={inProgress}
                                onClick={handleRestoreDfuButtonClick}
                            >
                                {i18n.translate('restoreFirmwarePanel.flashButton')}
                            </Button>
                        </>
                    ) : (
                        <p>
                            {i18n.translate(
                                'restoreFirmwarePanel.instruction2.ble.message',
                            )}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

const RestoreOfficialDialog: React.FunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.restoreOfficialDialog);
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <MultistepDialog
            isOpen={isOpen}
            title={i18n.translate('title', { lego: legoRegisteredTrademark })}
            onClose={() => dispatch(firmwareRestoreOfficialDialogHide())}
            backButtonProps={{ text: i18n.translate('backButton.label') }}
            nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            finalButtonProps={{
                text: i18n.translate('doneButton.label'),
                onClick: () => dispatch(firmwareRestoreOfficialDialogHide()),
            }}
        >
            <DialogStep
                id="hub"
                title={i18n.translate('selectHubPanel.title')}
                panel={<SelectHubPanel />}
            />
            <DialogStep
                id="restore"
                title={i18n.translate('restoreFirmwarePanel.title')}
                panel={<RestoreFirmwarePanel />}
            />
        </MultistepDialog>
    );
};

export default RestoreOfficialDialog;
