// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import './hub-center-dialog.scss';
import { Classes, Dialog, Icon } from '@blueprintjs/core';
import { Lightning } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import { HubCenterContext } from './HubCenterContext';
import HubIconComponent from './HubCenterIcon';
import PortComponent from './PortComponent';
import { hubcenterHideDialog } from './actions';
import { useI18n } from './i18n';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.hubcenter);
    const hubcenterStream = useContext(HubCenterContext);
    const [hubName, setHubName] = useState('');
    const [hubDetails, setHubDetails] = useState('');
    const [hubBattery, setHubBattery] = useState('');
    const [hubBatteryCharger, setHubBatteryCharger] = useState(false);
    const [hubButtons, setHubButtons] = useState([] as string[]);
    const portTypesBase = useRef(new Map<string, number>());
    const portValuesBase = useRef(new Map<string, string[]>());
    const [portTypes, setPortTypes] = useState(new Map<string, number>());
    const [portValues, setPortValues] = useState(new Map<string, string[]>());
    const collect_whole_line = useRef('');
    const dispatch = useDispatch();
    const i18n = useI18n();
    // const deviceName = useSelector((s) => s.ble.deviceName);
    // const deviceType = useSelector((s) => s.ble.deviceType);
    // const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);
    //const charging = useSelector((s) => s.ble.deviceBatteryCharging);
    // const lowBatteryWarning = useSelector((s) => s.ble.deviceLowBatteryWarning);

    // wire shared context to terminal output
    useEffect(() => {
        const subscription = hubcenterStream.dataSource.observable.subscribe({
            next: (d) => {
                // collect the complete line - might be replaced by HostBuffer
                if (d.charCodeAt(d.length - 1) !== 10) {
                    collect_whole_line.current += d;
                    return;
                } else {
                    d = collect_whole_line.current + d.trim();
                    collect_whole_line.current = '';
                }

                // react on the line
                const line = d.trim().split(',');
                const atype = line[0];
                const atype0 = line[0].charAt(0);
                if (atype0 > 'A' && atype0 < 'Z') {
                    switch (atype) {
                        case 'H':
                            {
                                setHubName(line[1]);
                                setHubDetails(line[3]);
                            }
                            break;
                        case 'BAT':
                            {
                                // setHubBattery(line[1]);
                                setHubBattery(line[2] + '%'); // percentage;
                                setHubBatteryCharger(parseInt(line[3]) > 0); // charger
                            }
                            break;
                        case 'BUT':
                            {
                                const btns = line[1].split('+');
                                setHubButtons(btns);
                            }
                            break;
                        case 'P':
                            {
                                const elem1 = line.slice(1);
                                const port = elem1[0];
                                const puptype = parseInt(elem1[1]) | 0;
                                const value: string[] = elem1.splice(2) || [];
                                portTypesBase.current.set(port, puptype);
                                portValuesBase.current.set(port, value);

                                // should not re-render on portvalues, hence storing the value in ref, but updating the state
                                const portTypesNew = new Map<string, number>(
                                    portTypesBase.current,
                                );
                                setPortTypes(portTypesNew);
                                const portValuesNew = new Map<string, string[]>(
                                    portValuesBase.current,
                                );
                                setPortValues(portValuesNew);
                            }
                            break;
                    }
                }
            },
        });

        return () => subscription.unsubscribe();
    }, [hubcenterStream]);

    return (
        <Dialog
            className="pb-hubcenter-dialog"
            title={i18n.translate('title')}
            isOpen={showDialog}
            onClose={() => dispatch(hubcenterHideDialog())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4>{hubName}</h4>
                <div style={{ justifyContent: 'space-between', display: 'flex' }}>
                    <span>{hubDetails}</span>
                    <span>
                        {hubBattery}
                        {hubBatteryCharger ? (
                            <Icon icon={<Lightning size={16} />}></Icon>
                        ) : (
                            <></>
                        )}
                    </span>
                </div>

                <div className="pb-hubcenter">
                    <HubIconComponent buttons={hubButtons}></HubIconComponent>

                    <div className="pb-device">
                        <PortComponent
                            port="A"
                            porttype={portTypes.get('A')}
                            portvalues={portValues.get('A')}
                        ></PortComponent>
                    </div>
                    <div className="port">A</div>
                    <div className="port">B</div>
                    <div className="pb-device">
                        <PortComponent
                            port="B"
                            porttype={portTypes.get('B')}
                            portvalues={portValues.get('B')}
                        ></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent
                            port="C"
                            porttype={portTypes.get('C')}
                            portvalues={portValues.get('C')}
                        ></PortComponent>
                    </div>
                    <div className="port">C</div>
                    <div className="port">D</div>
                    <div className="pb-device">
                        <PortComponent
                            port="D"
                            porttype={portTypes.get('D')}
                            portvalues={portValues.get('D')}
                        ></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent
                            port="E"
                            porttype={portTypes.get('E')}
                            portvalues={portValues.get('E')}
                        ></PortComponent>
                    </div>
                    <div className="port">E</div>
                    <div className="port">F</div>
                    <div className="pb-device">
                        <PortComponent
                            port="F"
                            porttype={portTypes.get('F')}
                            portvalues={portValues.get('F')}
                        ></PortComponent>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default HubcenterDialog;
