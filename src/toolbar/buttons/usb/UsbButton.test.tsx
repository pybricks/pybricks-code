// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { FocusScope } from 'react-aria';
import { testRender } from '../../../../test';
import { usbToggle } from '../../../usb/actions';
import UsbButton from './UsbButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(
        <FocusScope>
            <UsbButton id="test-usb-button" />
        </FocusScope>,
    );

    await act(() => user.click(button.getByRole('button', { name: 'USB' })));

    expect(dispatch).toHaveBeenCalledWith(usbToggle());
});
