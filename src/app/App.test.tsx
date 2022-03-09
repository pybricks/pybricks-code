// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import React from 'react';
import { testRender } from '../../test';
import App from './App';

it.each([false, true])('should render', (darkMode) => {
    testRender(<App />, { settings: { darkMode } });
});
