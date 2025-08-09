// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { AnyAction } from 'redux';
import { PnpIdVendorIdSource } from '../ble-device-info-service/protocol';
import {
    usbConnectPybricks,
    usbDidConnectPybricks,
    usbDidDisconnectPybricks,
    usbDidFailToConnectPybricks,
    usbDidFailToDisconnectPybricks,
    usbDisconnectPybricks,
} from './actions';
import reducers, { UsbConnectionState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "connection": "usb.connection.state.disconnected",
        }
    `);
});

test('connection', () => {
    expect(
        reducers(
            { connection: UsbConnectionState.Disconnected } as State,
            usbConnectPybricks(),
        ).connection,
    ).toBe(UsbConnectionState.Connecting);
    expect(
        reducers(
            { connection: UsbConnectionState.Connecting } as State,
            usbDidConnectPybricks({
                vendorIdSource: PnpIdVendorIdSource.UsbImpForum,
                vendorId: 0x1234,
                productId: 0x5678,
                productVersion: 1,
            }),
        ).connection,
    ).toBe(UsbConnectionState.Connected);
    expect(
        reducers(
            { connection: UsbConnectionState.Connecting } as State,
            usbDidFailToConnectPybricks(),
        ).connection,
    ).toBe(UsbConnectionState.Disconnected);
    expect(
        reducers(
            { connection: UsbConnectionState.Connected } as State,
            usbDisconnectPybricks(),
        ).connection,
    ).toBe(UsbConnectionState.Disconnecting);
    expect(
        reducers(
            { connection: UsbConnectionState.Disconnecting } as State,
            usbDidDisconnectPybricks(),
        ).connection,
    ).toBe(UsbConnectionState.Disconnected);
    expect(
        reducers(
            { connection: UsbConnectionState.Disconnecting } as State,
            usbDidFailToDisconnectPybricks(),
        ).connection,
    ).toBe(UsbConnectionState.Connected);
});
