// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import { didFailToFinish, didFinish, didProgress, didStart } from './actions';
import installPybricksDialog from './installPybricksDialog/reducers';

const flashing: Reducer<boolean> = (state = false, action) => {
    if (didStart.matches(action)) {
        return true;
    }

    if (didFinish.matches(action) || didFailToFinish.matches(action)) {
        return false;
    }

    return state;
};

const progress: Reducer<number | null> = (state = null, action) => {
    if (didStart.matches(action)) {
        return null;
    }

    if (didProgress.matches(action)) {
        return action.value;
    }

    return state;
};

export default combineReducers({ installPybricksDialog, flashing, progress });
