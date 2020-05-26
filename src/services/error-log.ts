// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from '../actions';
import { BootloaderConnectionActionType } from '../actions/bootloader';
import { combineServices } from '.';

async function consoleLog(action: Action): Promise<void> {
    switch (action.type) {
        case BootloaderConnectionActionType.DidError:
            console.error(action.err);
            break;
    }
}

export default combineServices(consoleLog);
