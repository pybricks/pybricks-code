// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Callout, Intent } from '@blueprintjs/core';
import React, { useMemo } from 'react';
import {
    pybricksUsbDfuWindowsDriverInstallUrl,
    pybricksUsbLinuxUdevRulesUrl,
} from '../../app/constants';
import { Hub, hubHasBluetoothButton, hubHasUSB } from '../../components/hubPicker';
import ExternalLinkIcon from '../../utils/ExternalLinkIcon';
import { isLinux, isWindows } from '../../utils/os';
import { useI18n } from './i18n';

type BootloaderInstructionsProps = {
    hubType: Hub;
};

/**
 * Provides customized instructions on how to enter bootloader mode based
 * on the hub type.
 */
const BootloaderInstructions: React.VoidFunctionComponent<
    BootloaderInstructionsProps
> = ({ hubType }) => {
    const i18n = useI18n();

    const { button, light, lightPattern } = useMemo(() => {
        return {
            button: i18n.translate(
                hubHasBluetoothButton(hubType) ? 'button.bluetooth' : 'button.power',
            ),
            light: i18n.translate(
                hubHasBluetoothButton(hubType) ? 'light.bluetooth' : 'light.status',
            ),
            lightPattern: i18n.translate(
                hubHasBluetoothButton(hubType)
                    ? 'lightPattern.bluetooth'
                    : 'lightPattern.status',
            ),
        };
    }, [i18n, hubType]);

    return (
        <>
            {hubHasUSB(hubType) && isLinux() && (
                <Callout intent={Intent.WARNING} icon="warning-sign">
                    {i18n.translate('warning.linux')}{' '}
                    <a
                        href={pybricksUsbLinuxUdevRulesUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {i18n.translate('warning.learnMore')}
                    </a>
                    <ExternalLinkIcon />
                </Callout>
            )}
            {hubHasUSB(hubType) && isWindows() && (
                <Callout intent={Intent.WARNING} icon="warning-sign">
                    {i18n.translate('warning.windows')}{' '}
                    <a
                        href={pybricksUsbDfuWindowsDriverInstallUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {i18n.translate('warning.learnMore')}
                    </a>
                    <ExternalLinkIcon />
                </Callout>
            )}
            <p>{i18n.translate('instruction')}</p>
            <ol>
                {hubHasUSB(hubType) && <li>{i18n.translate('step.disconnectUsb')}</li>}

                <li>{i18n.translate('step.powerOff')}</li>

                {/* City hub has power issues and requires disconnecting motors/sensors */}
                {hubType === Hub.City && <li>{i18n.translate('step.disconnectIo')}</li>}

                <li>{i18n.translate('step.holdButton', { button })}</li>

                {hubHasUSB(hubType) && <li>{i18n.translate('step.connectUsb')}</li>}

                <li>
                    {i18n.translate('step.waitForLight', {
                        button,
                        light,
                        lightPattern,
                    })}
                </li>

                <li>
                    {i18n.translate(
                        /* hubs with USB will keep the power on, but other hubs won't */
                        hubHasUSB(hubType) ? 'step.releaseButton' : 'step.keepHolding',
                        {
                            button,
                        },
                    )}
                </li>
            </ol>
        </>
    );
};

export default BootloaderInstructions;
