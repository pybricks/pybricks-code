// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { toggleBluetooth } from '../../../ble/actions';
import BluetoothButton from './BluetoothButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(
        <BluetoothButton id="test-bluetooth-button" />,
    );

    await act(() => user.click(button.getByRole('button', { name: 'Bluetooth' })));

    expect(dispatch).toHaveBeenCalledWith(toggleBluetooth());
});
