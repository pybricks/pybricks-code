// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { connect } from 'react-redux';
import { BleConnectionState } from '../ble/reducers';
import { BootloaderConnectionState } from '../lwp3-bootloader/reducers';
import * as notification from '../notifications/actions';
import { RootState } from '../reducers';
import OpenFileButton, { OpenFileButtonProps } from '../toolbar/OpenFileButton';
import { TooltipId } from '../toolbar/i18n';
import { flashFirmware } from './actions';
import firmwareIcon from './firmware.svg';

type StateProps = Pick<
    OpenFileButtonProps,
    'tooltip' | 'enabled' | 'showProgress' | 'progress'
>;
type DispatchProps = Pick<OpenFileButtonProps, 'onFile' | 'onReject' | 'onClick'>;
type OwnProps = Pick<OpenFileButtonProps, 'id'>;

const mapStateToProps = (state: RootState): StateProps => ({
    tooltip: state.firmware.flashing ? TooltipId.FlashProgress : TooltipId.Flash,
    enabled:
        state.bootloader.connection === BootloaderConnectionState.Disconnected &&
        state.ble.connection === BleConnectionState.Disconnected,
    showProgress: state.firmware.flashing,
    progress: state.firmware.progress === null ? undefined : state.firmware.progress,
});

const mapDispatchToProps: DispatchProps = {
    onFile: flashFirmware,
    onReject: (file) =>
        notification.add('error', `'${file.name}' is not a valid firmware file.`),
    onClick: () => flashFirmware(null),
};

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: OwnProps,
): OpenFileButtonProps => ({
    fileExtension: '.zip',
    icon: firmwareIcon,
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OpenFileButton);
