// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { didStringChange } from './actions';
import { StringSettingId, getDefaultStringValue } from './defaults';

const encoder = new TextEncoder();

const hubName: Reducer<string> = (
    state = getDefaultStringValue(StringSettingId.HubName),
    action,
) => {
    if (didStringChange.matches(action)) {
        if (action.id === StringSettingId.HubName) {
            return action.newState;
        }
        return state;
    }

    return state;
};

const isHubNameValid: Reducer<boolean> = (state = true, action) => {
    if (didStringChange.matches(action)) {
        if (action.id === StringSettingId.HubName) {
            const encoded = encoder.encode(action.newState);

            // Technically, the max hub name size is determined by each individual
            // firmware file, so we can't check until the firmware has been selected.
            // However all firmware currently has 16 bytes allocated (including zero-
            // termination), so we can hard code the check here to allow notifying the
            // user earlier for better UX.
            return encoded.length < 16;
        }
        return state;
    }

    return state;
};

export default combineReducers({
    hubName,
    isHubNameValid,
});
