// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { Classes, Dialog, Icon } from '@blueprintjs/core';
import { Lightning, Power } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useEventCallback } from 'usehooks-ts';
import { Button } from '../components/Button';
import { useSelector } from '../reducers';
import { HubCenterContext } from './HubCenterContext';
import PortComponent, { PortData } from './PortComponent';
import { executeAppDataCommand, hubcenterHideDialog } from './actions';
import './hub-center-dialog.scss';
import { useI18n } from './i18n';
import HubIconComponent, { getHubPortCount } from './icons/HubCenterIcon';

const HubcenterDialog: React.FunctionComponent = () => {
    const { showDialog, deviceName, deviceType, deviceFirmwareVersion } = useSelector(
        (s) => ({
            showDialog: s.hubcenter.showDialog,
            deviceName: s.ble.deviceName,
            deviceType: s.ble.deviceType,
            deviceFirmwareVersion: s.ble.deviceFirmwareVersion,
        }),
    );

    const hubcenterStream = useContext(HubCenterContext);
    const [hubBattery, setHubBattery] = useState('');
    const [hubBatteryCharger, setHubBatteryCharger] = useState(false);
    const [hubImuData, setHubImuData] = useState('');
    const portDataRef = useRef(new Map<string, PortData>());
    const portModesRef = useRef(new Map<string, string[]>());
    const [portData, setPortData] = useState(new Map<string, PortData>());
    const dispatch = useDispatch();
    const i18n = useI18n();
    const subscriptionRef = useRef<ZenObservable.Subscription | null>(null);
    const partialMessageRef = useRef('');

    // NOTE: port data reference contains the current value, subscription should be initied only on mount,
    //         and not be updated when it changes, while portData/setPortData will be updated on every message
    //         and triggers the component UI update.

    const parseArrayToMap = (input: string[]): Map<string, string> => {
        return input.reduce((map, pair) => {
            const [key, value] = pair.split('=');
            if (key && value) {
                map.set(key.trim(), value.trim());
            }
            return map;
        }, new Map<string, string>());
    };

    const processMessage = useCallback((message: string) => {
        const [key, ...dataraw] = message.split('\t');
        const dataMap = parseArrayToMap(dataraw);

        switch (key) {
            case 'battery':
                setHubBattery(dataMap.get('pct') ?? '');
                setHubBatteryCharger(parseInt(dataMap.get('s') ?? '') > 0);
                break;
            case 'imu':
                setHubImuData(dataraw.join(', '));
                break;
            default:
                if (key.startsWith('Port.')) {
                    const port = key;
                    const puptype = parseInt(dataraw[0]) ?? 0;
                    const dataStr = dataraw.slice(1).join(', ');

                    const portdata =
                        portDataRef.current.get(port) ??
                        ({
                            type: puptype,
                            dataMap: new Map<string, string>(),
                        } as PortData);
                    portdata.type = puptype;

                    if (!dataStr || puptype === 0) {
                        portDataRef.current.delete(port);
                        portModesRef.current.delete(port);
                    } else if (dataraw[1] === 'modes') {
                        portModesRef.current.set(port, dataraw.slice(2));
                    } else {
                        portdata.dataMap = dataMap;
                        portdata.dataStr = dataStr;
                        portDataRef.current.set(port, portdata);
                    }

                    setPortData(new Map(portDataRef.current));
                }
                break;
        }
    }, []);

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
        return () => subscriptionRef.current?.unsubscribe();
    }, [hubcenterStream.dataSource.observable, processMessage]);

    const portComponents = useMemo(() => {
        return [...Array(getHubPortCount(deviceType)).keys()].map((idx: number) => {
            const portLabel = String.fromCharCode(65 + idx); // A, B, C, D, E, F
            const side = idx % 2 === 0 ? 'left' : 'right';
            return (
                <PortComponent
                    key={portLabel}
                    portCode={portLabel}
                    portIndex={idx}
                    data={portData}
                    modes={portModesRef.current}
                    side={side}
                />
            );
        });
    }, [deviceType, portData]);

    const handleShutdown = useEventCallback(() => {
        const msg = new Uint8Array(['a'.charCodeAt(0), 's'.charCodeAt(0)]);
        dispatch(executeAppDataCommand(msg));
    });

    // useCallback( ??
    const handleHelloWorld = useEventCallback(() => {
        const msg = new Uint8Array(['a'.charCodeAt(0), 'h'.charCodeAt(0)]);
        console.log('handleHelloWorld', 1);
        dispatch(executeAppDataCommand(msg));
        console.log('handleHelloWorld', 2);
    });

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
                        {hubBatteryCharger && <Icon icon={<Lightning size={24} />} />}
                    </span>
                </h4>

                <div className={'pb-hubcenter ' + `hub_${getHubPortCount(deviceType)}`}>
                    <HubIconComponent deviceType={deviceType} hubImuData={hubImuData} />
                    {portComponents}
                </div>
                <div>
                    <Button
                        label="Shutdown"
                        icon={<Power size={24} />}
                        onPress={handleShutdown}
                    />
                    <Button
                        label="Hello World"
                        icon={<Power size={24} />}
                        onPress={handleHelloWorld}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default HubcenterDialog;
