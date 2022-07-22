// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

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

test('deviceName', () => {
    const testId = 'test-id';
    const testName = 'Test Name';

    expect(
        reducers({ deviceName: '' } as State, bleDidConnectPybricks(testId, testName))
            .deviceName,
    ).toBe(testName);

    expect(
        reducers({ deviceName: testName } as State, bleDidDisconnectPybricks())
            .deviceName,
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
        reducers({ deviceType: 'Move hub' } as State, bleDidDisconnectPybricks())
            .deviceType,
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
        reducers(
            { deviceFirmwareVersion: testVersion } as State,
            bleDidDisconnectPybricks(),
        ).deviceFirmwareVersion,
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
        reducers({ deviceLowBatteryWarning: true } as State, bleDidDisconnectPybricks())
            .deviceLowBatteryWarning,
    ).toBeFalsy();
});

test('deviceBatteryCharging', () => {
    expect(
        reducers({ deviceBatteryCharging: true } as State, bleDidDisconnectPybricks())
            .deviceBatteryCharging,
    ).toBeFalsy();
});
