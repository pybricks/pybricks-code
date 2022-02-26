// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { I18nContext, I18nManager } from '@shopify/react-i18n';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { BleConnectionState } from '../ble/reducers';
import { RootState } from '../reducers';
import StatusBar from './StatusBar';

it('should prevent browser context menu', () => {
    const store = {
        getState: jest.fn(() => ({
            ble: { connection: BleConnectionState.Disconnected, deviceName: '' },
        })),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    } as unknown as Store;
    render(
        <Provider store={store}>
            <StatusBar />
        </Provider>,
    );

    expect(fireEvent.contextMenu(screen.getByRole('status'))).toBe(false);
});

it('should show popover when hub name is clicked', async () => {
    const testHubName = 'Test hub';

    const store = mock<Store<RootState>>({
        getState: () =>
            mock<RootState>({
                ble: {
                    connection: BleConnectionState.Connected,
                    deviceName: testHubName,
                    deviceType: 'hub type',
                    deviceFirmwareVersion: 'v0.0.0',
                    deviceLowBatteryWarning: false,
                    deviceBatteryCharging: false,
                },
            }),
    });

    const i18n = new I18nManager({ locale: 'en' });

    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <StatusBar />
            </I18nContext.Provider>
        </Provider>,
    );

    userEvent.click(screen.getByText(testHubName));

    await waitFor(() => screen.getByText('Connected to:'));
});

it('should show popover when battery is clicked', async () => {
    const testHubName = 'Test hub';

    const store = mock<Store<RootState>>({
        getState: () =>
            mock<RootState>({
                ble: {
                    connection: BleConnectionState.Connected,
                    deviceName: testHubName,
                    deviceType: 'hub type',
                    deviceFirmwareVersion: 'v0.0.0',
                    deviceLowBatteryWarning: false,
                    deviceBatteryCharging: false,
                },
            }),
    });

    const i18n = new I18nManager({ locale: 'en' });

    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <StatusBar />
            </I18nContext.Provider>
        </Provider>,
    );

    userEvent.click(screen.getByTitle('Battery'));

    await waitFor(() => screen.getByText('Battery level is OK.'));
});
