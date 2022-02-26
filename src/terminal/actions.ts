// SPDX-License-Identifier: MIT
// Copyright (c) 2020,2022 The Pybricks Authors

import { createAction } from '../actions';

export const sendData = createAction((data: string) => ({
    type: 'terminal.action.sendData',
    value: data,
}));

export const receiveData = createAction((data: string) => ({
    type: 'terminal.action.receiveData',
    value: data,
}));
