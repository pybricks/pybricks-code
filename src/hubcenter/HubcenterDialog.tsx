// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import './hubcenterDialog.scss';
import { AnchorButton, Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useId } from 'react';
import { useDispatch } from 'react-redux';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import { useSelector } from '../reducers';
import { hubcenterHideDialog } from './actions';
import { useI18n } from './i18n';
import { hubStartRepl } from '../hub/actions';
import ActionButton from '../toolbar/ActionButton';
import hubIcon from './hub.svg';
import motorIcon from './motor.svg';
import colorsensorIcon from './colorsensor.svg';
import ussensorIcon from './ussensor.svg';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.hubcenter);
    const dispatch = useDispatch();
    const i18n = useI18n();
    const deviceName = useSelector((s) => s.ble.deviceName);
    const deviceType = useSelector((s) => s.ble.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);
    //const charging = useSelector((s) => s.ble.deviceBatteryCharging);
    const lowBatteryWarning = useSelector((s) => s.ble.deviceLowBatteryWarning);

    const useLegacyDownload = false;
    //dispatch(hubStartRepl(useLegacyDownload));
    const testButtonId = useId();

    return (
        <Dialog
            className="pb-hubcenter-dialog"
            title={i18n.translate('title')}
            isOpen={showDialog}
            onClose={() => dispatch(hubcenterHideDialog())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4>{deviceName}</h4>
                <div><span>{deviceType}</span>, <span>firmware: {deviceFirmwareVersion}</span>
                    <span>{lowBatteryWarning}</span>
                </div>

                <div className="pb-hubcenter">
                    <img src={hubIcon} className="pb-hub-icon" />
                    
                    <div className="pb-device">
                        <img src={motorIcon} />
                        <div className="value">62°</div>
                    </div>
                    <div className="port">A</div>
                    <div className="port">B</div>
                    <div className="pb-device">
                        <img src={motorIcon} />
                        <div className="value">225°</div>
                    </div>

                    <div className="pb-device">
                        <img src={colorsensorIcon} />
                        <div className="value">120</div>
                    </div>
                    <div className="port">C</div>
                    <div className="port">D</div>
                    <div className="pb-device">
                    </div>

                    <div className="pb-device">
                        <img src={ussensorIcon} />
                        <div className="value">22</div>
                    </div>
                    <div className="port">E</div>
                    <div className="port">F</div>
                    <div className="pb-device">
                    </div>
                </div>

                {/* <Button
                    id={testButtonId}
                    content="REPL"
                    onClick={() => dispatch(hubStartRepl(useLegacyDownload))}
                /> */}
            </div>
        </Dialog>
    );
};

export default HubcenterDialog;
