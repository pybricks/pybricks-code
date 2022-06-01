// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Reducer, combineReducers } from 'redux';
import {
    newFileWizardDidAccept,
    newFileWizardDidCancel,
    newFileWizardShow,
} from './actions';

/** Controls the new file wizard dialog isOpen state. */
const isOpen: Reducer<boolean> = (state = false, action) => {
    if (newFileWizardShow.matches(action)) {
        return true;
    }

    if (
        newFileWizardDidAccept.matches(action) ||
        newFileWizardDidCancel.matches(action)
    ) {
        return false;
    }

    return state;
};

export default combineReducers({ isOpen });
