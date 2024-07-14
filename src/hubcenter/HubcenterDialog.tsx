// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import './hubcenterDialog.scss';
import { AnchorButton, Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import { string } from 'prop-types';
import React, { useContext, useEffect, useId, useState } from 'react';
import { useDispatch } from 'react-redux';
import { receiveData } from 'src/terminal/actions';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import { hubStartRepl } from '../hub/actions';
import { useSelector } from '../reducers';
import ActionButton from '../toolbar/ActionButton';
import { HubcenterContext } from './HubcenterContext';
import PortComponent from './PortComponent';
import { hubcenterHideDialog } from './actions';
import colorsensorIcon from './colorsensor.svg';
import hubIcon from './hub.svg';
import { useI18n } from './i18n';
import motorIcon from './motor.svg';
import PortDetail from './portdetail';
import ussensorIcon from './ussensor.svg';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.hubcenter);
    const hubcenterStream = useContext(HubcenterContext);
    const [hubName, setHubName] = useState('');
    const [hubDetails, setHubDetails] = useState('');
    const [portTypes, setPortTypes] = useState(new Map<string, number>());
    const [portValues, setPortValues] = useState(new Map<string, string>());
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

    // wire shared context to terminal output
    useEffect(() => {
        // console.log('useEffect');
        const subscription = hubcenterStream.dataSource.observable.subscribe({
            // next: (d) => xterm.write(d),
            next: (d) => {
                //console.log('>>>> hc.effect', d);
                const line = d.split(',');
                const atype = line[0];
                const atype0 = line[0].charAt(0);
                if (atype0 > 'A' && atype0 < 'Z') {
                    if (atype === 'H') {
                        setHubName(line[1]);
                        // TODO: line is split
                        // setHubDetails(line[3]);
                    } else if (atype === 'P') {
                        const portTypesNew = new Map<string, number>();
                        for (const elem of line.slice(1)) {
                            const elem1 = elem.split('=');
                            const port = elem1[0];
                            const puptype = parseInt(elem1[1]);
                            portTypesNew.set(port, puptype);
                        }
                        setPortTypes(portTypesNew);
                    } else if (atype.startsWith('P:')) {
                        const portValuesNew = new Map<string, string>(portValues);
                        const elem1 = line.slice(1);
                        const port = atype.charAt(2);
                        const value = elem1[1];
                        portValuesNew.set(port, value);
                        setPortValues(portValuesNew);
                        console.log(portValues);
                    }
                }
            },
        });

        return () => subscription.unsubscribe();
    }, [hubcenterStream, portValues]);
    // TODO: should no re-render on portValues, --> but how to solve better?

    return (
        <Dialog
            className="pb-hubcenter-dialog"
            title={i18n.translate('title')}
            isOpen={showDialog}
            onClose={() => dispatch(hubcenterHideDialog())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4>{hubName}</h4>
                <div>
                    <span>{hubDetails}</span>
                </div>

                <div className="pb-hubcenter">
                    <img src={hubIcon} className="pb-hub-icon" />

                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('A')}
                            portvalue={portValues.get('A')}
                        ></PortComponent>
                    </div>
                    <div className="port">A</div>
                    <div className="port">B</div>
                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('B')}
                            portvalue={portValues.get('B')}
                        ></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('C')}
                            portvalue={portValues.get('C')}
                        ></PortComponent>
                    </div>
                    <div className="port">C</div>
                    <div className="port">D</div>
                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('D')}
                            portvalue={portValues.get('D')}
                        ></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('E')}
                            portvalue={portValues.get('E')}
                        ></PortComponent>
                    </div>
                    <div className="port">E</div>
                    <div className="port">F</div>
                    <div className="pb-device">
                        <PortComponent
                            porttype={portTypes.get('F')}
                            portvalue={portValues.get('F')}
                        ></PortComponent>
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
