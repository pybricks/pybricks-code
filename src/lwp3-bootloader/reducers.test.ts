// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    BootloaderConnectionFailureReason,
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didFailToDisconnect,
    disconnect,
    disconnectRequest,
    rebootRequest,
} from './actions';
import reducers, { BootloaderConnectionState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "connection": "bootloader.connection.disconnected",
        }
    `);
});

test('connection', () => {
    expect(
        reducers(
            { connection: BootloaderConnectionState.Disconnected } as State,
            connect(),
        ).connection,
    ).toBe(BootloaderConnectionState.Connecting);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Connecting } as State,
            didConnect(),
        ).connection,
    ).toBe(BootloaderConnectionState.Connected);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Connecting } as State,
            didFailToConnect(BootloaderConnectionFailureReason.Canceled),
        ).connection,
    ).toBe(BootloaderConnectionState.Disconnected);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Connected } as State,
            disconnect(),
        ).connection,
    ).toBe(BootloaderConnectionState.Disconnecting);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Disconnecting } as State,
            didDisconnect(),
        ).connection,
    ).toBe(BootloaderConnectionState.Disconnected);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Disconnecting } as State,
            didFailToDisconnect(),
        ).connection,
    ).toBe(BootloaderConnectionState.Connected);

    // certain commands are also know to trigger disconnect

    expect(
        reducers(
            { connection: BootloaderConnectionState.Connected } as State,
            rebootRequest(0),
        ).connection,
    ).toBe(BootloaderConnectionState.Disconnecting);
    expect(
        reducers(
            { connection: BootloaderConnectionState.Connected } as State,
            disconnectRequest(0),
        ).connection,
    ).toBe(BootloaderConnectionState.Disconnecting);
});
