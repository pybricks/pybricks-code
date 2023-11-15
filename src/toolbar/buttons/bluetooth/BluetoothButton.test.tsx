// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender } from '../../../../test';
import { toggleBluetooth } from '../../../ble/actions';
import BluetoothButton from './BluetoothButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(
        <FocusScope>
            <BluetoothButton id="test-bluetooth-button" />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'Bluetooth' })));

    expect(dispatch).toHaveBeenCalledWith(toggleBluetooth());
});
