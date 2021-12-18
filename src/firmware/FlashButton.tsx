// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BleConnectionState } from '../ble/reducers';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import * as notificationActions from '../notifications/actions';
import { RootState } from '../reducers';
import OpenFileButton, { OpenFileButtonProps } from '../toolbar/OpenFileButton';
import { TooltipId } from '../toolbar/i18n';
import { flashFirmware } from './actions';
import firmwareIcon from './firmware.svg';

type FlashButtonProps = Pick<OpenFileButtonProps, 'id'>;

const FlashButton: React.FunctionComponent<FlashButtonProps> = (props) => {
    const bootloaderConnection = useSelector(
        (state: RootState) => state.bootloader.connection,
    );
    const bleConnection = useSelector((state: RootState) => state.ble.connection);
    const flashing = useSelector((state: RootState) => state.firmware.flashing);
    const progress = useSelector((state: RootState) => state.firmware.progress);

    const dispatch = useDispatch();

    return (
        <OpenFileButton
            fileExtension=".zip"
            icon={firmwareIcon}
            tooltip={flashing ? TooltipId.FlashProgress : TooltipId.Flash}
            enabled={
                bootloaderConnection === BootloaderConnectionState.Disconnected &&
                bleConnection === BleConnectionState.Disconnected
            }
            showProgress={flashing}
            progress={progress === null ? undefined : progress}
            onFile={(data) => dispatch(flashFirmware(data))}
            onReject={(file) =>
                dispatch(
                    notificationActions.add(
                        'error',
                        `'${file.name}' is not a valid firmware file.`,
                    ),
                )
            }
            onClick={() => dispatch(flashFirmware(null))}
            {...props}
        />
    );
};

export default FlashButton;
