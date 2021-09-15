// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { firmwareVersion } from '@pybricks/firmware';
import { Action } from '../actions';
import {
    BleDeviceDidFailToConnectReason,
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didFailToDisconnect,
    disconnect,
} from './actions';
import reducers, { BleConnectionState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as Action)).toMatchInlineSnapshot(`
        Object {
          "connection": "ble.connection.state.disconnected",
        }
    `);
});

test('connection', () => {
    expect(
        reducers({ connection: BleConnectionState.Disconnected } as State, connect())
            .connection,
    ).toBe(BleConnectionState.Connecting);
    expect(
        reducers(
            { connection: BleConnectionState.Connecting } as State,
            didConnect(firmwareVersion),
        ).connection,
    ).toBe(BleConnectionState.Connected);
    expect(
        reducers(
            { connection: BleConnectionState.Connecting } as State,
            didFailToConnect({} as BleDeviceDidFailToConnectReason),
        ).connection,
    ).toBe(BleConnectionState.Disconnected);
    expect(
        reducers({ connection: BleConnectionState.Connected } as State, disconnect())
            .connection,
    ).toBe(BleConnectionState.Disconnecting);
    expect(
        reducers(
            { connection: BleConnectionState.Disconnecting } as State,
            didDisconnect(),
        ).connection,
    ).toBe(BleConnectionState.Disconnected);
    expect(
        reducers(
            { connection: BleConnectionState.Disconnecting } as State,
            didFailToDisconnect(),
        ).connection,
    ).toBe(BleConnectionState.Connected);
});
