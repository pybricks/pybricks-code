// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { flashFirmware } from '../../../firmware/actions';
import FlashButton from './FlashButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', () => {
    const [button, dispatch] = testRender(<FlashButton id="test-flash-button" />);

    button.getByRole('button', { name: 'Flash' }).click();

    expect(dispatch).toHaveBeenCalledWith(flashFirmware(null, false, ''));
});
