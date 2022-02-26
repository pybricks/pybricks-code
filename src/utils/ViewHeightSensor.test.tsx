// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { render } from '@testing-library/react';
import React from 'react';
import ViewHeightSensor from './ViewHeightSensor';

it('should set the --pb-vh variable on resize', () => {
    render(<ViewHeightSensor />);
    // REVISIT: it is not easy to test the resize event since jest-dom doesn't do layout
});
