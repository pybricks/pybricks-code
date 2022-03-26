// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/** Action that indicates that a code editor was created. */
export const editorDidCreate = createAction(() => ({
    type: 'editor.action.didCreate',
}));
