// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes, Dialog } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
    pybricksBleFirmwareRestoreVideoUrl,
    pybricksDfuRestoreUrl,
} from '../../app/constants';
import { useSelector } from '../../reducers';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { firmwareRestoreOfficialDialogHide } from './actions';
import { useI18n } from './i18n';

const RestoreOfficialDialog: React.VoidFunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.restoreOfficialDialog);
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <Dialog
            isOpen={isOpen}
            title={i18n.translate('title')}
            onClose={() => dispatch(firmwareRestoreOfficialDialogHide())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4>{i18n.translate('poweredUpHubs.title')}</h4>
                <p>{i18n.translate('poweredUpHubs.message')}</p>
                <p>
                    <a
                        href={pybricksBleFirmwareRestoreVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {i18n.translate('poweredUpHubs.action')}
                    </a>
                    <ExternalLinkIcon />
                </p>
                <h4>{i18n.translate('spikeHubs.title')}</h4>
                <p>{i18n.translate('spikeHubs.message')}</p>
                <p>
                    <a href={pybricksDfuRestoreUrl} target="_blank" rel="noreferrer">
                        {i18n.translate('spikeHubs.action')}
                    </a>
                    <ExternalLinkIcon />
                </p>
            </div>
        </Dialog>
    );
};

export default RestoreOfficialDialog;
