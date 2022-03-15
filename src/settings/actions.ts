// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/** Requests to toggle the showDocs setting. */
export const settingsToggleShowDocs = createAction(() => ({
    type: 'editor.action.toggleShowDocs',
}));
