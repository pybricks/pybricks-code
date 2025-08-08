// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2025 The Pybricks Authors

import { act, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import { BleConnectionState } from '../ble/reducers';
import { HubRuntimeState } from '../hub/reducers';
import StatusBar from './StatusBar';

it('should show popover when hub name is clicked', async () => {
    const testHubName = 'Test hub';

    const [user, statusBar] = testRender(<StatusBar />, {
        ble: {
            connection: BleConnectionState.Connected,
            deviceName: testHubName,
            deviceType: 'hub type',
            deviceFirmwareVersion: 'v0.0.0',
            deviceLowBatteryWarning: false,
            deviceBatteryCharging: false,
        },
        hub: { runtime: HubRuntimeState.Idle },
    });

    await act(() => user.click(statusBar.getByText(testHubName)));

    await waitFor(() => statusBar.getByText('Connected to:'));
});

it('should show popover when battery is clicked', async () => {
    const testHubName = 'Test hub';

    const [user, statusBar] = testRender(<StatusBar />, {
        ble: {
            connection: BleConnectionState.Connected,
            deviceName: testHubName,
            deviceType: 'hub type',
            deviceFirmwareVersion: 'v0.0.0',
            deviceLowBatteryWarning: false,
            deviceBatteryCharging: false,
        },
        hub: { runtime: HubRuntimeState.Idle },
    });

    await act(() => user.click(statusBar.getByTitle('Battery')));

    await waitFor(() => statusBar.getByText('Battery level is OK.'));
});
