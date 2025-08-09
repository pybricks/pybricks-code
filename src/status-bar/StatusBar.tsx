// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2025 The Pybricks Authors

import './status-bar.scss';
import {
    Button,
    Classes,
    Icon,
    IconSize,
    Intent,
    Popover,
    PopoverProps,
    ProgressBar,
    Spinner,
} from '@blueprintjs/core';
import { Disable, Error, TickCircle } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { CompletionEngineStatus } from '../editor/redux/codeCompletion';
import { HubRuntimeState } from '../hub/reducers';
import { useSelector } from '../reducers';
import { useI18n } from './i18n';

const commonPopoverProps: Partial<PopoverProps> = {
    popoverClassName: Classes.POPOVER_CONTENT_SIZING,
    placement: 'top',
};

const CompletionEngineIndicator: React.FunctionComponent = () => {
    const { status } = useSelector((s) => s.editor.codeCompletion);
    const i18n = useI18n();

    const icon = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return <Spinner size={IconSize.STANDARD} />;
            case CompletionEngineStatus.Ready:
                return <Icon icon={<TickCircle />} />;
            case CompletionEngineStatus.Failed:
                return <Icon icon={<Error />} />;
            default:
                return <Icon icon={<Disable />} />;
        }
    }, [status]);

    const message = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return i18n.translate('completionEngineStatus.message.loading');
            case CompletionEngineStatus.Ready:
                return i18n.translate('completionEngineStatus.message.ready');
            case CompletionEngineStatus.Failed:
                return i18n.translate('completionEngineStatus.message.failed');
            default:
                return i18n.translate('completionEngineStatus.message.unknown');
        }
    }, [status, i18n]);

    return (
        <Popover {...commonPopoverProps} content={message}>
            <div
                aria-label={i18n.translate('completionEngineStatus.label')}
                role="button"
                aria-haspopup="dialog"
                style={{ cursor: 'pointer' }}
            >
                {icon}
            </div>
        </Popover>
    );
};

const HubInfoButton: React.FunctionComponent = () => {
    const i18n = useI18n();
    const deviceName = useSelector((s) => s.hub.deviceName);
    const deviceType = useSelector((s) => s.hub.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.hub.deviceFirmwareVersion);

    return (
        <Popover
            {...commonPopoverProps}
            content={
                <table className="no-wrap" style={{ userSelect: 'text' }}>
                    <tbody>
                        <tr>
                            <td>
                                <strong>{i18n.translate('hubInfo.connectedTo')}</strong>
                            </td>
                            <td>{deviceName}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>{i18n.translate('hubInfo.hubType')}</strong>
                            </td>
                            <td>{deviceType}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>{i18n.translate('hubInfo.firmware')}</strong>
                            </td>
                            <td>v{deviceFirmwareVersion}</td>
                        </tr>
                    </tbody>
                </table>
            }
        >
            <Button title={i18n.translate('hubInfo.title')} minimal={true}>
                {deviceName}
            </Button>
        </Popover>
    );
};

const BatteryIndicator: React.FunctionComponent = () => {
    const i18n = useI18n();
    const charging = useSelector((s) => s.hub.deviceBatteryCharging);
    const lowBatteryWarning = useSelector((s) => s.hub.deviceLowBatteryWarning);

    return (
        <Popover
            {...commonPopoverProps}
            content={
                <span className="no-wrap">
                    {i18n.translate(lowBatteryWarning ? 'battery.low' : 'battery.ok')}
                </span>
            }
        >
            <div
                title={i18n.translate('battery.title')}
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
        </Popover>
    );
};

const StatusBar: React.FunctionComponent = () => {
    const runtime = useSelector((s) => s.hub.runtime);

    return (
        <div
            className={classNames('pb-status-bar', Classes.DARK)}
            role="status"
            aria-live="off"
        >
            <div className="pb-status-bar-group">
                <CompletionEngineIndicator />
            </div>
            <div className="pb-status-bar-group">
                {runtime !== HubRuntimeState.Disconnected && (
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
