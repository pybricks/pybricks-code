// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { BleConnectionState } from '../../../ble/reducers';
import { flashFirmware } from '../../../firmware/actions';
import { BootloaderConnectionState } from '../../../lwp3-bootloader/reducers';
import * as notificationActions from '../../../notifications/actions';
import { useSelector } from '../../../reducers';
import {
    useSettingFlashCurrentProgram,
    useSettingHubName,
} from '../../../settings/hooks';
import OpenFileButton, { OpenFileButtonProps } from '../../../toolbar/OpenFileButton';
import { I18nId } from './i18n';
import icon from './icon.svg';

type FlashButtonProps = Pick<OpenFileButtonProps, 'id'>;

const FlashButton: React.VoidFunctionComponent<FlashButtonProps> = ({ id }) => {
    const bootloaderConnection = useSelector((s) => s.bootloader.connection);
    const bleConnection = useSelector((s) => s.ble.connection);
    const flashing = useSelector((s) => s.firmware.flashing);
    const progress = useSelector((s) => s.firmware.progress);
    const [isSettingFlashCurrentProgramEnabled] = useSettingFlashCurrentProgram();
    const { hubName } = useSettingHubName();

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();
    const dispatch = useDispatch();

    return (
        <OpenFileButton
            id={id}
            label={i18n.translate(I18nId.Label)}
            fileExtension=".zip"
            icon={icon}
            tooltip={
                progress
                    ? i18n.translate(I18nId.TooltipProgress, {
                          percent: i18n.formatPercentage(progress),
                      })
                    : i18n.translate(I18nId.TooltipAction)
            }
            enabled={
                bootloaderConnection === BootloaderConnectionState.Disconnected &&
                bleConnection === BleConnectionState.Disconnected
            }
            showProgress={flashing}
            progress={progress === null ? undefined : progress}
            onFile={(data) =>
                dispatch(
                    flashFirmware(data, isSettingFlashCurrentProgramEnabled, hubName),
                )
            }
            onReject={(file) =>
                dispatch(
                    notificationActions.add(
                        'error',
                        `'${file.name}' is not a valid firmware file.`,
                    ),
                )
            }
            onClick={() =>
                dispatch(
                    flashFirmware(null, isSettingFlashCurrentProgramEnabled, hubName),
                )
            }
        />
    );
};

export default FlashButton;
