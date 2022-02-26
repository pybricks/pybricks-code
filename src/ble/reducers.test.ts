// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
} from '../ble-device-info-service/actions';
import { PnpIdVendorIdSource } from '../ble-device-info-service/protocol';
import { HubType, LegoCompanyId } from '../ble-lwp3-service/protocol';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
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
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        Object {
          "connection": "ble.connection.state.disconnected",
          "deviceBatteryCharging": false,
          "deviceFirmwareVersion": "",
          "deviceLowBatteryWarning": false,
          "deviceName": "",
          "deviceType": "",
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
            didConnect('test-id', 'Test Name'),
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

test('deviceName', () => {
    const testId = 'test-id';
    const testName = 'Test Name';

    expect(
        reducers({ deviceName: '' } as State, didConnect(testId, testName)).deviceName,
    ).toBe(testName);

    expect(
        reducers({ deviceName: testName } as State, didDisconnect()).deviceName,
    ).toBe('');
});

test('deviceType', () => {
    expect(
        reducers(
            { deviceType: '' } as State,
            bleDIServiceDidReceivePnPId({
                vendorIdSource: PnpIdVendorIdSource.BluetoothSig,
                vendorId: LegoCompanyId,
                productId: HubType.MoveHub,
                productVersion: 0,
            }),
        ).deviceType,
    ).toBe('Move hub');

    expect(
        reducers({ deviceType: 'Move hub' } as State, didDisconnect()).deviceType,
    ).toBe('');
});

test('deviceFirmwareVersion', () => {
    const testVersion = '3.0.0';

    expect(
        reducers(
            { deviceFirmwareVersion: '' } as State,
            bleDIServiceDidReceiveFirmwareRevision(testVersion),
        ).deviceFirmwareVersion,
    ).toBe(testVersion);

    expect(
        reducers({ deviceFirmwareVersion: testVersion } as State, didDisconnect())
            .deviceFirmwareVersion,
    ).toBe('');
});

test('deviceLowBatteryWarning', () => {
    expect(
        reducers(
            { deviceLowBatteryWarning: false } as State,
            didReceiveStatusReport(statusToFlag(Status.BatteryLowVoltageWarning)),
        ).deviceLowBatteryWarning,
    ).toBeTruthy();

    expect(
        reducers(
            { deviceLowBatteryWarning: true } as State,
            didReceiveStatusReport(~statusToFlag(Status.BatteryLowVoltageWarning)),
        ).deviceLowBatteryWarning,
    ).toBeFalsy();

    expect(
        reducers({ deviceLowBatteryWarning: true } as State, didDisconnect())
            .deviceLowBatteryWarning,
    ).toBeFalsy();
});

test('deviceBatteryCharging', () => {
    expect(
        reducers({ deviceBatteryCharging: true } as State, didDisconnect())
            .deviceBatteryCharging,
    ).toBeFalsy();
});
