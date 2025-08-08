// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2025 The Pybricks Authors

import { AnyAction } from 'redux';
import {
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDisconnectPybricks,
} from '../ble/actions';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
    bleDIServiceDidReceiveSoftwareRevision,
} from '../ble-device-info-service/actions';
import { PnpId, PnpIdVendorIdSource } from '../ble-device-info-service/protocol';
import { HubType, LegoCompanyId } from '../ble-lwp3-service/protocol';
import {
    blePybricksServiceDidNotReceiveHubCapabilities,
    blePybricksServiceDidReceiveHubCapabilities,
    didReceiveStatusReport,
} from '../ble-pybricks-service/actions';
import {
    FileFormat,
    HubCapabilityFlag,
    Status,
    statusToFlag,
} from '../ble-pybricks-service/protocol';
import {
    didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
    hubDidFailToStartRepl,
    hubDidFailToStopUserProgram,
    hubDidStartRepl,
    hubDidStopUserProgram,
    hubStartRepl,
    hubStopUserProgram,
} from './actions';
import reducers, { HubRuntimeState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "deviceBatteryCharging": false,
          "deviceFirmwareVersion": "",
          "deviceLowBatteryWarning": false,
          "deviceName": "",
          "deviceType": "",
          "downloadProgress": null,
          "hasRepl": false,
          "maxBleWriteSize": 0,
          "maxUserProgramSize": 0,
          "numOfSlots": 0,
          "preferredFileFormat": null,
          "runtime": "hub.runtime.disconnected",
          "selectedSlot": 0,
          "useLegacyDownload": false,
          "useLegacyStartUserProgram": false,
          "useLegacyStdio": false,
        }
    `);
});

describe('runtime', () => {
    test('', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                bleDidConnectPybricks('test-id', 'Test Name'),
            ).runtime,
        ).toBe(HubRuntimeState.Unknown);
    });

    test.each(Object.values(HubRuntimeState))(
        'bleDisconnectPybricks',
        (startingState) => {
            // all states are overridden by disconnect
            expect(
                reducers({ runtime: startingState } as State, bleDisconnectPybricks())
                    .runtime,
            ).toBe(
                startingState === HubRuntimeState.Disconnected
                    ? HubRuntimeState.Disconnected
                    : HubRuntimeState.Unknown,
            );
        },
    );

    test.each(Object.values(HubRuntimeState))('didDisconnect', (startingState) => {
        // all states are overridden by disconnect
        expect(
            reducers({ runtime: startingState } as State, bleDidDisconnectPybricks())
                .runtime,
        ).toBe(HubRuntimeState.Disconnected);
    });

    test('didStartDownload', () => {
        // download ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                didStartDownload(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);
        expect(
            reducers({ runtime: HubRuntimeState.Idle } as State, didStartDownload())
                .runtime,
        ).toBe(HubRuntimeState.Loading);
    });

    test('didProgressDownload', () => {
        // download ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                didProgressDownload(0),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);

        // this shouldn't have any effect
        expect(
            reducers(
                { runtime: HubRuntimeState.Loading } as State,
                didProgressDownload(0),
            ).runtime,
        ).toBe(HubRuntimeState.Loading);
    });

    test('didFinishDownload', () => {
        // download ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                didFinishDownload(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);

        // normal operation
        expect(
            reducers({ runtime: HubRuntimeState.Loading } as State, didFinishDownload())
                .runtime,
        ).toBe(HubRuntimeState.Unknown);
    });

    test('didFinishDownload', () => {
        // download ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                didFailToFinishDownload(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);

        // normal operation for error path
        expect(
            reducers(
                { runtime: HubRuntimeState.Loading } as State,
                didFailToFinishDownload(),
            ).runtime,
        ).toBe(HubRuntimeState.Idle);
    });

    test('didReceiveStatusReport', () => {
        // don't ever expect this to happen in practice since we can't receive
        // updates while disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning), 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);

        // status update ignored while download not finished
        expect(
            reducers(
                { runtime: HubRuntimeState.Loading } as State,
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning), 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.Loading);

        // normal operation - user program started
        expect(
            reducers(
                { runtime: HubRuntimeState.Unknown } as State,
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning), 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.Running);

        // really short program run finished before receiving download finished
        expect(
            reducers(
                { runtime: HubRuntimeState.Unknown } as State,
                didReceiveStatusReport(0, 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.Idle);

        // normal operation - user program stopped
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                didReceiveStatusReport(0, 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.Idle);

        // ignored during start repl command
        expect(
            reducers(
                { runtime: HubRuntimeState.StartingRepl } as State,
                didReceiveStatusReport(0, 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.StartingRepl);

        // ignored during stop user program command
        expect(
            reducers(
                { runtime: HubRuntimeState.StoppingUserProgram } as State,
                didReceiveStatusReport(0, 0, 0),
            ).runtime,
        ).toBe(HubRuntimeState.StoppingUserProgram);
    });

    test('hubStartRepl', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                hubStartRepl(false, false),
            ).runtime,
        ).toBe(HubRuntimeState.StartingRepl);
    });

    test('hubDidStartRepl', () => {
        expect(
            reducers({ runtime: HubRuntimeState.Running } as State, hubDidStartRepl())
                .runtime,
        ).toBe(HubRuntimeState.Unknown);

        // ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                hubDidStartRepl(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);
    });

    test('hubDidFailToStartRepl', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                hubDidFailToStartRepl(),
            ).runtime,
        ).toBe(HubRuntimeState.Unknown);

        // ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                hubDidFailToStartRepl(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);
    });

    test('hubStopUserProgram', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                hubStopUserProgram(),
            ).runtime,
        ).toBe(HubRuntimeState.StoppingUserProgram);
    });

    test('hubStopUserProgram', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                hubDidStopUserProgram(),
            ).runtime,
        ).toBe(HubRuntimeState.Unknown);

        // ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                hubDidStopUserProgram(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);
    });

    test('hubDidFailToStopUserProgram', () => {
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                hubDidFailToStopUserProgram(),
            ).runtime,
        ).toBe(HubRuntimeState.Unknown);

        // ignored if disconnected
        expect(
            reducers(
                { runtime: HubRuntimeState.Disconnected } as State,
                hubDidFailToStopUserProgram(),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);
    });
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
            didReceiveStatusReport(statusToFlag(Status.BatteryLowVoltageWarning), 0, 0),
        ).deviceLowBatteryWarning,
    ).toBeTruthy();

    expect(
        reducers(
            { deviceLowBatteryWarning: true } as State,
            didReceiveStatusReport(
                ~statusToFlag(Status.BatteryLowVoltageWarning),
                0,
                0,
            ),
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

describe('maxBleWriteSize', () => {
    test.each([100, 1000])('Pybricks Profile >= v1.2.0: %s', (size) => {
        expect(
            reducers(
                { maxBleWriteSize: 0 } as State,
                blePybricksServiceDidReceiveHubCapabilities(size, 0, 100, 0),
            ).maxBleWriteSize,
        ).toBe(size);
    });
});

describe('maxUserProgramSize', () => {
    test.each([100, 1000])('Pybricks Profile >= v1.2.0: %s', (size) => {
        expect(
            reducers(
                { maxUserProgramSize: 0 } as State,
                blePybricksServiceDidReceiveHubCapabilities(23, 0, size, 0),
            ).maxUserProgramSize,
        ).toBe(size);
    });
});

describe('hasRepl', () => {
    test.each([...Object.values(HubType).filter((x) => typeof x !== 'string')])(
        'Pybricks Profile < v1.2.0: %s',
        (hubType) => {
            expect(
                reducers(
                    { hasRepl: false } as State,
                    blePybricksServiceDidNotReceiveHubCapabilities(
                        { productId: hubType } as PnpId,
                        '3.3.0',
                    ),
                ).hasRepl,
            ).toBe(hubType !== HubType.MoveHub);
        },
    );

    test.each([HubCapabilityFlag.HasRepl, 0])(
        'Pybricks Profile >= v1.2.0: %s',
        (flag) => {
            expect(
                reducers(
                    { hasRepl: true } as State,
                    blePybricksServiceDidReceiveHubCapabilities(23, flag, 100, 0),
                ).hasRepl,
            ).toBe(Boolean(flag & HubCapabilityFlag.HasRepl));
        },
    );
});

describe('preferredFileFormat', () => {
    test('Pybricks Profile < v1.2.0 and older firmware', () => {
        expect(
            reducers(
                { preferredFileFormat: null } as State,
                blePybricksServiceDidNotReceiveHubCapabilities({} as PnpId, '3.1.0'),
            ).preferredFileFormat,
        ).toBe(FileFormat.Mpy5);
    });

    test('Pybricks Profile < v1.2.0', () => {
        expect(
            reducers(
                { preferredFileFormat: null } as State,
                blePybricksServiceDidNotReceiveHubCapabilities({} as PnpId, '3.2.0'),
            ).preferredFileFormat,
        ).toBe(FileFormat.Mpy6);
    });

    test('Pybricks Profile >= v1.2.0', () => {
        expect(
            reducers(
                { preferredFileFormat: null } as State,
                blePybricksServiceDidReceiveHubCapabilities(
                    23,
                    HubCapabilityFlag.UserProgramMultiMpy6,
                    100,
                    0,
                ),
            ).preferredFileFormat,
        ).toBe(FileFormat.MultiMpy6);
    });

    test('Pybricks Profile >= v1.2.0, unsupported firmware', () => {
        expect(
            reducers(
                { preferredFileFormat: FileFormat.MultiMpy6 } as State,
                blePybricksServiceDidReceiveHubCapabilities(23, 0, 100, 0),
            ).preferredFileFormat,
        ).toBeNull();
    });
});

describe('useLegacyDownload', () => {
    test('Pybricks Profile < v1.2.0', () => {
        expect(
            reducers(
                { useLegacyDownload: false } as State,
                blePybricksServiceDidNotReceiveHubCapabilities({} as PnpId, '3.3.0'),
            ).useLegacyDownload,
        ).toBeTruthy();
    });

    test('Pybricks Profile >= v1.2.0', () => {
        expect(
            reducers(
                { useLegacyDownload: true } as State,
                blePybricksServiceDidReceiveHubCapabilities(23, 0, 100, 0),
            ).useLegacyDownload,
        ).toBeFalsy();
    });
});

describe('useLegacyStdio', () => {
    test('old', () => {
        expect(
            reducers(
                { useLegacyStdio: false } as State,
                bleDIServiceDidReceiveSoftwareRevision('1.2.0'),
            ).useLegacyStdio,
        ).toBeTruthy();
    });

    test('new', () => {
        expect(
            reducers(
                { useLegacyStdio: true } as State,
                bleDIServiceDidReceiveSoftwareRevision('1.3.0'),
            ).useLegacyStdio,
        ).toBeFalsy();
    });
});

describe('useLegacyStartUserProgram', () => {
    test('Pybricks Profile < v1.4.0', () => {
        expect(
            reducers(
                { useLegacyStartUserProgram: false } as State,
                bleDIServiceDidReceiveSoftwareRevision('1.3.0'),
            ).useLegacyStartUserProgram,
        ).toBeTruthy();
    });

    test('Pybricks Profile >= v1.4.0', () => {
        expect(
            reducers(
                { useLegacyStartUserProgram: true } as State,
                bleDIServiceDidReceiveSoftwareRevision('1.4.0'),
            ).useLegacyStartUserProgram,
        ).toBeFalsy();
    });
});
