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
import HubIconComponent, { getHubPortCount } from './icons/HubCenterIcon';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.hubcenter);
    const hubcenterStream = useContext(HubCenterContext);
    const [hubBattery, setHubBattery] = useState('');
    const [hubBatteryCharger, setHubBatteryCharger] = useState(false);
    const [hubImuData, setHubImuData] = useState('');
    const portDataRef = useRef(new Map<string, PortData>());
    const [portData, setPortData] = useState(new Map<string, PortData>());
    const dispatch = useDispatch();
    const i18n = useI18n();
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

    const processMessage = useCallback((message: string) => {
        const line = message.split('\t');
        const key = line[0];
        const dataraw = line.slice(1);
        const dataMap = parseArrayToMap(dataraw ?? []);

        switch (key) {
            case 'battery':
                {
                    const percentage = dataMap.get('pct') ?? '';
                    // const voltage = data[1];
                    const hasCharger = parseInt(dataMap.get('s') ?? '') > 0;
                    setHubBattery(percentage);
                    setHubBatteryCharger(hasCharger);
                }
                break;
            case 'imu':
                {
                    const dataStr = dataraw?.join(', ');
                    setHubImuData(dataStr);
                }
                break;
            default:
                {
                    if (key.startsWith('Port.')) {
                        const port = line[0]; // Port.A
                        const puptype = parseInt(line[1]) ?? 0;
                        const dataStr = line?.slice(2)?.join(', ');

                        const portdata =
                            portDataRef.current.get(port) ??
                            ({
                                type: puptype,
                                dataMap: new Map<string, string>(),
                            } as PortData);

                        portdata.type = puptype;
                        if (!dataStr || puptype === 0) {
                            // NOOP
                            portdata.dataMap = new Map<string, string>();
                            portdata.dataStr = '';
                        } else if (line[2] === 'modes') {
                            // NOOP
                            //break;
                        } else {
                            portdata.dataMap = dataMap;
                            portdata.dataStr = dataStr;
                        }

                        portDataRef.current.set(port, portdata);
                        setPortData(new Map(portDataRef.current));
                    }
                }
                break;
        }
    }, []);

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

    const deviceName = useSelector((s) => s.ble.deviceName);
    const deviceType = useSelector((s) => s.ble.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);
    const devicePortsCount = getHubPortCount(deviceType);

    return (
        <Dialog
            className="pb-hubcenter-dialog"
            title={i18n.translate('title')}
            isOpen={showDialog}
            onClose={() => dispatch(hubcenterHideDialog())}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4 className="title">
                    <span>{deviceName}</span>
                    <span>
                        {deviceType}, {deviceFirmwareVersion}, {hubBattery}
                        {hubBatteryCharger ? (
                            <Icon icon={<Lightning size={24} />}></Icon>
                        ) : (
                            <></>
                        )}
                    </span>
                </h4>

                <div className="pb-hubcenter">
                    <HubIconComponent
                        deviceType={deviceType}
                        hubImuData={hubImuData}
                    ></HubIconComponent>
                    <PortComponent port="A" data={portData} side="left" />
                    <PortComponent port="B" data={portData} side="right" />
                    {devicePortsCount > 2 ? (
                        <>
                            <PortComponent port="C" data={portData} side="left" />
                            <PortComponent port="D" data={portData} side="right" />
                        </>
                    ) : (
                        ''
                    )}
                    {devicePortsCount > 4 ? (
                        <>
                            <PortComponent port="E" data={portData} side="left" />
                            <PortComponent port="F" data={portData} side="right" />
                        </>
                    ) : (
                        ''
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default HubcenterDialog;
