// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../../../test';
import { HubRuntimeState } from '../../../hub/reducers';
import { tourStart } from '../../../tour/actions';
import TourButton from './TourButton';

afterEach(() => {
    cleanup();
});

it('should dispatch action when clicked', async () => {
    const [user, button, dispatch] = testRender(<TourButton id="test-tour-button" />, {
        hub: { runtime: HubRuntimeState.Running },
    });

    await user.click(button.getByRole('button', { name: 'Tour Pybricks Code' }));

    expect(dispatch).toHaveBeenCalledWith(tourStart());
});
