// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { toggleBluetooth } from '../../../ble/actions';
import BluetoothButton from './BluetoothButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', () => {
    const [button, dispatch] = testRender(<BluetoothButton />);

    button.getByRole('button', { name: 'Bluetooth' }).click();

    expect(dispatch).toHaveBeenCalledWith(toggleBluetooth());
});
