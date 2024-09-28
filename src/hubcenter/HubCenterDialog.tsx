// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { Classes, Dialog, Icon } from '@blueprintjs/core';
import { Lightning } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import { HubCenterContext } from './HubCenterContext';
import PortComponent, { PortData } from './PortComponent';
import { hubcenterHideDialog } from './actions';
import './hub-center-dialog.scss';
import { useI18n } from './i18n';
import HubIconComponent from './icons/HubCenterIcon';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.hubcenter);
    const hubcenterStream = useContext(HubCenterContext);
    const [hubName, setHubName] = useState('');
    const [hubDetails, setHubDetails] = useState('');
    const [hubBattery, setHubBattery] = useState('');
    const [hubBatteryCharger, setHubBatteryCharger] = useState(false);
    const [hubButtons, setHubButtons] = useState([] as string[]);
    const portDataRef = useRef(new Map<string, PortData>());
    const [portData, setPortData] = useState(new Map<string, PortData>());
    const dispatch = useDispatch();
    const i18n = useI18n();
    const deviceType = useSelector((s) => s.ble.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);
    const subscriptionRef = useRef<ZenObservable.Subscription | null>(null);

    // NOTE: port data reference contains the current value, subscription should be initied only on mount,
    //         and not be updated when it changes, while portData/setPortData will be updated on every message
    //         and triggers the component UI update.

    function parseArrayToMap(input: string[]): Map<string, string> {
        return input.reduce((map, pair) => {
            const [key, value] = pair.split('=');
            if (key && value) {
                map.set(key.trim(), value.trim());
            }
            return map;
        }, new Map<string, string>());
    }

    const processMessage = useCallback(
        (message: string) => {
            const line = message.split('\t');
            const key = line?.[0];
            const dataraw = line?.slice(1);
            const data = parseArrayToMap(dataraw ?? []);

            switch (key) {
                case 'hub':
                    {
                        setHubName(data.get('n') ?? '');
                        const details = [
                            deviceType,
                            deviceFirmwareVersion,
                            data.get('v') ?? '',
                        ]
                            .filter((e) => !!e)
                            .join(', ');
                        setHubDetails(details);
                    }
                    break;
                case 'battery':
                    {
                        const percentage = data.get('pct') ?? '';
                        // const voltage = data[1];
                        const hasCharger = parseInt(data.get('s') ?? '') > 0;
                        setHubBattery(percentage);
                        setHubBatteryCharger(hasCharger);
                    }
                    break;
                case 'buttons':
                    {
                        const btns = dataraw[0]?.split(',');
                        setHubButtons(btns);
                    }
                    break;
                default:
                    {
                        if (key.startsWith('Port.')) {
                            const port = line[0]; // Port.A
                            const puptype = parseInt(line[1]) ?? 0;

                            const data = portDataRef.current.get(port) ?? {
                                type: puptype,
                                values: [] as string[],
                            };

                            data.type = puptype;
                            if (!line[2]) {
                                // NOOP
                                data.values = [];
                            } else if (line[2] === 'modes') {
                                // NOOP
                                //break;
                            } else {
                                data.values = line.slice(2);
                            }

                            portDataRef.current.set(port, data);
                            setPortData(new Map(portDataRef.current));
                        }
                    }
                    break;
            }
        },
        [deviceType, deviceFirmwareVersion],
    );

    const partialMessageRef = useRef('');
    useEffect(() => {
        subscriptionRef.current = hubcenterStream.dataSource.observable.subscribe({
            next: (d) => {
                const combinedMessage = partialMessageRef.current + d;
                const parts = combinedMessage.split('\n');

                // Process all complete messages
                for (let i = 0; i < parts.length - 1; i++) {
                    const message = parts[i].trim();
                    if (message) {
                        processMessage(message);
                    }
                }

                // Remember any partial leftover
                partialMessageRef.current = parts[parts.length - 1];
            },
        });

        // Cleanup subscription on unmount
        return () => subscriptionRef?.current?.unsubscribe();
    }, [hubcenterStream.dataSource.observable, processMessage]);

    return (
        <Dialog
            className="pb-hubcenter-dialog"
            title={i18n.translate('title')}
            isOpen={showDialog}
            onClose={() => dispatch(hubcenterHideDialog())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4 style={{ justifyContent: 'space-between', display: 'flex' }}>
                    {hubName}
                    <span>
                        {hubBattery}
                        {hubBatteryCharger ? (
                            <Icon icon={<Lightning size={16} />}></Icon>
                        ) : (
                            <></>
                        )}
                    </span>
                </h4>
                <div>{hubDetails}</div>

                <div className="pb-hubcenter">
                    <HubIconComponent buttons={hubButtons}></HubIconComponent>

                    <div className="pb-device">
                        <PortComponent port="Port.A" data={portData}></PortComponent>
                    </div>
                    <div className="port-label">A</div>
                    <div className="port-label">B</div>
                    <div className="pb-device">
                        <PortComponent port="Port.B" data={portData}></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent port="Port.C" data={portData}></PortComponent>
                    </div>
                    <div className="port-label">C</div>
                    <div className="port-label">D</div>
                    <div className="pb-device">
                        <PortComponent port="Port.D" data={portData}></PortComponent>
                    </div>

                    <div className="pb-device">
                        <PortComponent port="Port.E" data={portData}></PortComponent>
                    </div>
                    <div className="port-label">E</div>
                    <div className="port-label">F</div>
                    <div className="pb-device">
                        <PortComponent port="Port.F" data={portData}></PortComponent>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default HubcenterDialog;
