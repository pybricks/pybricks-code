// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2025 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    bleConnectPybricks,
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDidFailToConnectPybricks,
    bleDidFailToDisconnectPybricks,
    bleDisconnectPybricks,
} from './actions';
import reducers, { BleConnectionState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "connection": "ble.connection.state.disconnected",
        }
    `);
});

test('connection', () => {
    expect(
        reducers(
            { connection: BleConnectionState.Disconnected } as State,
            bleConnectPybricks(),
        ).connection,
    ).toBe(BleConnectionState.Connecting);
    expect(
        reducers(
            { connection: BleConnectionState.Connecting } as State,
            bleDidConnectPybricks('test-id', 'Test Name'),
        ).connection,
    ).toBe(BleConnectionState.Connected);
    expect(
        reducers(
            { connection: BleConnectionState.Connecting } as State,
            bleDidFailToConnectPybricks(),
        ).connection,
    ).toBe(BleConnectionState.Disconnected);
    expect(
        reducers(
            { connection: BleConnectionState.Connected } as State,
            bleDisconnectPybricks(),
        ).connection,
    ).toBe(BleConnectionState.Disconnecting);
    expect(
        reducers(
            { connection: BleConnectionState.Disconnecting } as State,
            bleDidDisconnectPybricks(),
        ).connection,
    ).toBe(BleConnectionState.Disconnected);
    expect(
        reducers(
            { connection: BleConnectionState.Disconnecting } as State,
            bleDidFailToDisconnectPybricks(),
        ).connection,
    ).toBe(BleConnectionState.Connected);
});
