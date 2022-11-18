// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import {
    Button,
    Classes,
    DialogStep,
    Intent,
    MultistepDialog,
} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
    legoRegisteredTrademark,
    pybricksBleFirmwareRestoreVideoUrl,
} from '../../app/constants';
import { hubHasUSB } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { firmwareRestoreOfficialDfu } from '../actions';
import BootloaderInstructions from '../bootloaderInstructions/BootloaderInstructions';
import { firmwareRestoreOfficialDialogHide } from './actions';
import { useI18n } from './i18n';

const SelectHubPanel: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <p>
                {i18n.translate('selectHubPanel.message', {
                    lego: legoRegisteredTrademark,
                    next: (
                        <strong>{i18n.translate('selectHubPanel.nextButton')}</strong>
                    ),
                })}
            </p>
            <div className="pb-spacer" />
            <HubPicker />
        </div>
    );
};

const RestoreFirmwarePanel: React.VoidFunctionComponent = () => {
    const [hubType] = useHubPickerSelectedHub();
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <BootloaderInstructions hubType={hubType} />
            {hubHasUSB(hubType) ? (
                <>
                    <p>
                        {i18n.translate('restoreFirmwarePanel.instruction2.dfu', {
                            flashFirmware: (
                                <strong>
                                    {i18n.translate('restoreFirmwarePanel.flashButton')}
                                </strong>
                            ),
                            lego: legoRegisteredTrademark,
                        })}
                    </p>
                    <div className="pb-spacer" />
                    <Button
                        intent={Intent.PRIMARY}
                        onClick={() => dispatch(firmwareRestoreOfficialDfu(hubType))}
                    >
                        {i18n.translate('restoreFirmwarePanel.flashButton')}
                    </Button>
                </>
            ) : (
                <p>
                    {i18n.translate('restoreFirmwarePanel.instruction2.ble.message', {
                        lego: legoRegisteredTrademark,
                        thisVideo: (
                            <>
                                <a
                                    href={pybricksBleFirmwareRestoreVideoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {i18n.translate(
                                        'restoreFirmwarePanel.instruction2.ble.thisVideo',
                                    )}
                                </a>
                                <ExternalLinkIcon />
                            </>
                        ),
                    })}
                </p>
            )}
        </div>
    );
};

const RestoreOfficialDialog: React.VoidFunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.restoreOfficialDialog);
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <MultistepDialog
            isOpen={isOpen}
            title={i18n.translate('title', { lego: legoRegisteredTrademark })}
            onClose={() => dispatch(firmwareRestoreOfficialDialogHide())}
            finalButtonProps={{
                text: i18n.translate('doneButton.label'),
                onClick: () => dispatch(firmwareRestoreOfficialDialogHide()),
            }}
        >
            <DialogStep
                id="hub"
                title={i18n.translate('selectHubPanel.title')}
                panel={<SelectHubPanel />}
                nextButtonProps={{ text: i18n.translate('selectHubPanel.nextButton') }}
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
