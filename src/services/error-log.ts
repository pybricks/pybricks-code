// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from '../actions';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionFailureReason,
} from '../actions/lwp3-bootloader';
import { combineServices } from '.';

/**
 * Logs unexpected errors to console.error and expected errors to console.debug.
 * @param action An action
 */
function consoleLog(action: Action): void {
    switch (action.type) {
        case BootloaderConnectionActionType.DidFailToConnect:
            if (action.reason === BootloaderConnectionFailureReason.Unknown) {
                console.error(action.err);
            } else {
                console.debug(action.err);
            }
            break;
        case BootloaderConnectionActionType.DidError:
            console.error(action.err);
            break;
    }
}

export default combineServices(consoleLog);
