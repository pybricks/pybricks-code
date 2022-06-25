// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import {
    Button,
    Icon,
    IconSize,
    Intent,
    ProgressBar,
    Spinner,
} from '@blueprintjs/core';
import { Classes as Classes2, Popover2, Popover2Props } from '@blueprintjs/popover2';
import React, { useMemo } from 'react';
import { BleConnectionState } from '../ble/reducers';
import { CompletionEngineStatus } from '../editor/redux/codeCompletion';
import { useSelector } from '../reducers';
import { I18nId, useI18n } from './i18n';

import './status-bar.scss';

const commonPopoverProps: Partial<Popover2Props> = {
    popoverClassName: Classes2.POPOVER2_CONTENT_SIZING,
    placement: 'top',
};

const CompletionEngineIndicator: React.VoidFunctionComponent = () => {
    const { status } = useSelector((s) => s.editor.codeCompletion);
    const i18n = useI18n();

    const icon = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return <Spinner size={IconSize.STANDARD} />;
            case CompletionEngineStatus.Ready:
                return <Icon icon="tick-circle" />;
            case CompletionEngineStatus.Failed:
                return <Icon icon="error" />;
            default:
                return <Icon icon="disable" />;
        }
    }, [status]);

    const message = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return i18n.translate(I18nId.CompletionEngineStatusMessageLoading);
            case CompletionEngineStatus.Ready:
                return i18n.translate(I18nId.CompletionEngineStatusMessageReady);
            case CompletionEngineStatus.Failed:
                return i18n.translate(I18nId.CompletionEngineStatusMessageFailed);
            default:
                return i18n.translate(I18nId.CompletionEngineStatusMessageUnknown);
        }
    }, [status, i18n]);

    return (
        <Popover2 {...commonPopoverProps} content={message}>
            <div
                aria-label={i18n.translate(I18nId.CompletionEngineStatusLabel)}
                style={{ cursor: 'pointer' }}
            >
                {icon}
            </div>
        </Popover2>
    );
};

const HubInfoButton: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    const deviceName = useSelector((s) => s.ble.deviceName);
    const deviceType = useSelector((s) => s.ble.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);

    return (
        <Popover2
            {...commonPopoverProps}
            content={
                <table className="no-wrap">
                    <tbody>
                        <tr>
                            <td>
                                <strong>
                                    {i18n.translate(I18nId.HubInfoConnectedTo)}
                                </strong>
                            </td>
                            <td>{deviceName}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>{i18n.translate(I18nId.HubInfoHubType)}</strong>
                            </td>
                            <td>{deviceType}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>
                                    {i18n.translate(I18nId.HubInfoFirmware)}
                                </strong>
                            </td>
                            <td>v{deviceFirmwareVersion}</td>
                        </tr>
                    </tbody>
                </table>
            }
        >
            <Button title={i18n.translate(I18nId.HubInfoTitle)} minimal={true}>
                {deviceName}
            </Button>
        </Popover2>
    );
};

const BatteryIndicator: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    const charging = useSelector((s) => s.ble.deviceBatteryCharging);
    const lowBatteryWarning = useSelector((s) => s.ble.deviceLowBatteryWarning);

    return (
        <Popover2
            {...commonPopoverProps}
            content={
                <span className="no-wrap">
                    {i18n.translate(
                        lowBatteryWarning ? I18nId.BatteryLow : I18nId.BatteryOk,
                    )}
                </span>
            }
        >
            <div
                title={i18n.translate(I18nId.BatteryTitle)}
                className="pb-battery-indicator"
                style={{ cursor: 'pointer' }}
            >
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
    const connection = useSelector((s) => s.ble.connection);

    return (
        <div className="pb-status-bar" role="status" aria-live="off">
            <div className="pb-status-bar-group">
                <CompletionEngineIndicator />
            </div>
            <div className="pb-status-bar-group">
                {connection === BleConnectionState.Connected && (
                    <>
                        <HubInfoButton />
                        <BatteryIndicator />
                    </>
                )}
            </div>
        </div>
    );
};

export default StatusBar;
