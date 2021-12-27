// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Button, Intent, ProgressBar } from '@blueprintjs/core';
import { Classes as Classes2, Popover2, Popover2Props } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useSelector } from 'react-redux';
import { BleConnectionState } from '../ble/reducers';
import { RootState } from '../reducers';
import { MessageId } from './i18n';
import en from './i18n.en.json';

import './status-bar.scss';

const commonPopoverProps: Partial<Popover2Props> = {
    popoverClassName: Classes2.POPOVER2_CONTENT_SIZING,
    placement: 'top',
};

const HubInfoButton: React.VFC = (_props) => {
    const deviceName = useSelector((state: RootState) => state.ble.deviceName);
    const deviceType = useSelector((state: RootState) => state.ble.deviceType);
    const deviceFirmwareVersion = useSelector(
        (state: RootState) => state.ble.deviceFirmwareVersion,
    );

    const [i18n] = useI18n({ id: 'statusBar', translations: { en }, fallback: en });

    return (
        <Popover2
            {...commonPopoverProps}
            content={
                <table className="no-wrap">
                    <tbody>
                        <tr>
                            <td>
                                <strong>
                                    {i18n.translate(MessageId.HubInfoConnectedTo)}
                                </strong>
                            </td>
                            <td>{deviceName}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>
                                    {i18n.translate(MessageId.HubInfoHubType)}
                                </strong>
                            </td>
                            <td>{deviceType}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>
                                    {i18n.translate(MessageId.HubInfoFirmware)}
                                </strong>
                            </td>
                            <td>v{deviceFirmwareVersion}</td>
                        </tr>
                    </tbody>
                </table>
            }
        >
            <Button minimal={true} onMouseDown={(e) => e.preventDefault()}>
                {deviceName}
            </Button>
        </Popover2>
    );
};

const BatteryIndicator: React.VFC = (_props) => {
    const charging = useSelector((state: RootState) => state.ble.deviceBatteryCharging);
    const lowBatteryWarning = useSelector(
        (state: RootState) => state.ble.deviceLowBatteryWarning,
    );

    const [i18n] = useI18n({ id: 'statusBar', translations: { en }, fallback: en });

    return (
        <Popover2
            {...commonPopoverProps}
            content={
                <span className="no-wrap">
                    {i18n.translate(
                        lowBatteryWarning ? MessageId.BatteryLow : MessageId.BatteryOk,
                    )}
                </span>
            }
        >
            <div className="pb-battery-indicator" style={{ cursor: 'pointer' }}>
                <div className="pb-battery-indicator-body">
                    <ProgressBar
                        animate={charging}
                        stripes={charging}
                        intent={lowBatteryWarning ? Intent.DANGER : Intent.SUCCESS}
                    />
                </div>
                <div className="pb-battery-indicator-tip" />
            </div>
        </Popover2>
    );
};

const StatusBar: React.VFC = (_props) => {
    const connection = useSelector((state: RootState) => state.ble.connection);

    return (
        <div
            className="pb-status-bar"
            role="status"
            aria-live="off"
            onContextMenu={(e): void => e.preventDefault()}
        >
            {connection === BleConnectionState.Connected && (
                <>
                    <HubInfoButton />
                    <BatteryIndicator />
                </>
            )}
        </div>
    );
};

export default StatusBar;
