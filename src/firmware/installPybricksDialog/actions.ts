// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../../actions';

/** Actions that request the install Pybricks firmware dialog to be shown. */
export const firmwareInstallPybricksDialogShow = createAction(() => ({
    type: 'firmware.installPybricksDialog.action.show',
}));

type FlashMethod = 'ble-lwp3-bootloader' | 'usb-lego-dfu';

/**
 * Action that indicates the user accepted the install Pybricks firmware dialog.
 * @param flashMethod The connection method and protocol used for flashing.
 * @param firmwareZip The firmware.zip raw data.
 * @param hubName The hub name to use when flashing firmware.
 */
export const firmwareInstallPybricksDialogAccept = createAction(
    (flashMethod: FlashMethod, firmwareZip: ArrayBuffer, hubName: string) => ({
        type: 'firmware.installPybricksDialog.action.accept',
        flashMethod,
        firmwareZip,
        hubName,
    }),
);

/** Actions that indicates the user canceled the install Pybricks firmware dialog. */
export const firmwareInstallPybricksDialogCancel = createAction(() => ({
    type: 'firmware.installPybricksDialog.action.cancel',
}));
