// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { createAction } from '../actions';
import { PnpId } from '../ble-device-info-service/protocol';

/**
 * Creates an action that initiates a connection to a hub running Pybricks firmware.
 */
export const usbConnectPybricks = createAction(() => ({
    type: 'usb.action.connectPybricks',
}));
/**
 * Creates an action that indicates that a usb connection was started due to a
 * hot plug event.
 */
export const usbHotPlugConnectPybricks = createAction(() => ({
    type: 'usb.action.hotPlugConnectPybricks',
}));

/**
 * Response that indicates {@link usbConnectPybricks} or {@link usbHotPlugConnectPybricks} succeeded.
 */
export const usbDidConnectPybricks = createAction((pnpId: PnpId) => ({
    type: 'usb.device.action.didConnectPybricks',
    pnpId,
}));

/**
 * Response that indicates {@link usbConnectPybricks} or {@link usbHotPlugConnectPybricks} failed.
 */
export const usbDidFailToConnectPybricks = createAction(() => ({
    type: 'usb.action.didFailToConnectPybricks',
}));

/**
 * Creates an action to request disconnecting a hub running Pybricks firmware.
 */
export const usbDisconnectPybricks = createAction(() => ({
    type: 'usb.action.disconnectPybricks',
}));

/**
 * Creates an action that indicates that {@link usbDisconnectPybricks} succeeded.
 */
export const usbDidDisconnectPybricks = createAction(() => ({
    type: 'usb.action.didDisconnectPybricks',
}));

/**
 * Creates an action that indicates that {@link usbDisconnectPybricks} failed.
 */
export const usbDidFailToDisconnectPybricks = createAction(() => ({
    type: 'usb.action.didFailToDisconnectPybricks',
}));

/**
 * Indicates that a response to a Pybricks message was received.
 * @statusCode The status code of the response.
 */
export const usbDidReceivePybricksMessageResponse = createAction(
    (statusCode: number) => ({
        type: 'usb.action.didReceivePybricksMessageResponse',
        statusCode,
    }),
);

/** Action that indicates the device name characteristic was read. */
export const usbDidReceiveDeviceName = createAction((deviceName: string) => ({
    type: 'action.usb.didReceiveDeviceName',
    deviceName,
}));

/** Action that indicates the software revision characteristic was read. */
export const usbDidReceiveSoftwareRevision = createAction((version: string) => ({
    type: 'action.usb.didReceiveSoftwareRevision',
    version,
}));

/** Action that indicates the firmware revision characteristic was read. */
export const usbDidReceiveFirmwareRevision = createAction((version: string) => ({
    type: 'action.usb.didReceiveFirmwareRevision',
    version,
}));

/**
 * Subscribe to Pybricks events (equivalent of enable notifications on the
 * Pybricks control/events BLE characteristic)
 */
export const usbPybricksSubscribe = createAction(() => ({
    type: 'usb.action.pybricksSubscribe',
}));

export const usbPybricksDidSubscribe = createAction(() => ({
    type: 'usb.action.pybricksDidSubscribe',
}));

export const usbPybricksDidFailToSubscribe = createAction(() => ({
    type: 'usb.action.pybricksDidFailToSubscribe',
}));

export const usbPybricksUnsubscribe = createAction(() => ({
    type: 'usb.action.pybricksUnsubscribe',
}));

export const usbPybricksDidUnsubscribe = createAction(() => ({
    type: 'usb.action.pybricksDidUnsubscribe',
}));

export const usbPybricksDidFailToUnsubscribe = createAction(() => ({
    type: 'usb.action.pybricksDidFailToUnsubscribe',
}));

/**
 * High-level BLE actions.
 */

export const usbToggle = createAction(() => ({
    type: 'usb.action.toggle',
}));
