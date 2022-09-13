// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { AnyAction } from 'redux';
import { didReceiveStatusReport } from '../ble-pybricks-service/actions';
import { Status, statusToFlag } from '../ble-pybricks-service/protocol';
import { bleDidConnectPybricks, bleDidDisconnectPybricks } from '../ble/actions';
import {
    didFailToFinishDownload,
    didFinishDownload,
    didProgressDownload,
    didStartDownload,
} from './actions';
import reducers, { HubRuntimeState } from './reducers';

type State = ReturnType<typeof reducers>;

test('initial state', () => {
    expect(reducers(undefined, {} as AnyAction)).toMatchInlineSnapshot(`
        {
          "downloadProgress": null,
          "mpyAbiVersion": 6,
          "runtime": "hub.runtime.disconnected",
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
        ).toBe(HubRuntimeState.Loaded);
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
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning)),
            ).runtime,
        ).toBe(HubRuntimeState.Disconnected);

        // status update ignored while download not finished
        expect(
            reducers(
                { runtime: HubRuntimeState.Loading } as State,
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning)),
            ).runtime,
        ).toBe(HubRuntimeState.Loading);

        // normal operation - user program started
        expect(
            reducers(
                { runtime: HubRuntimeState.Loaded } as State,
                didReceiveStatusReport(statusToFlag(Status.UserProgramRunning)),
            ).runtime,
        ).toBe(HubRuntimeState.Running);

        // really short program run finished before receiving download finished
        expect(
            reducers(
                { runtime: HubRuntimeState.Loaded } as State,
                didReceiveStatusReport(0),
            ).runtime,
        ).toBe(HubRuntimeState.Idle);

        // normal operation - user program stopped
        expect(
            reducers(
                { runtime: HubRuntimeState.Running } as State,
                didReceiveStatusReport(0),
            ).runtime,
        ).toBe(HubRuntimeState.Idle);
    });
});
