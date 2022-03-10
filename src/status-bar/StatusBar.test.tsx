// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import { BleConnectionState } from '../ble/reducers';
import StatusBar from './StatusBar';

it('should prevent browser context menu', () => {
    const [statusBar] = testRender(<StatusBar />, {
        ble: { connection: BleConnectionState.Disconnected, deviceName: '' },
    });

    expect(fireEvent.contextMenu(statusBar.getByRole('status'))).toBe(false);
});

it('should show popover when hub name is clicked', async () => {
    const testHubName = 'Test hub';

    const [statusBar] = testRender(<StatusBar />, {
        ble: {
            connection: BleConnectionState.Connected,
            deviceName: testHubName,
            deviceType: 'hub type',
            deviceFirmwareVersion: 'v0.0.0',
            deviceLowBatteryWarning: false,
            deviceBatteryCharging: false,
        },
    });

    userEvent.click(statusBar.getByText(testHubName));

    await waitFor(() => statusBar.getByText('Connected to:'));
});

it('should show popover when battery is clicked', async () => {
    const testHubName = 'Test hub';

    const [statusBar] = testRender(<StatusBar />, {
        ble: {
            connection: BleConnectionState.Connected,
            deviceName: testHubName,
            deviceType: 'hub type',
            deviceFirmwareVersion: 'v0.0.0',
            deviceLowBatteryWarning: false,
            deviceBatteryCharging: false,
        },
    });

    userEvent.click(statusBar.getByTitle('Battery'));

    await waitFor(() => statusBar.getByText('Battery level is OK.'));
});
