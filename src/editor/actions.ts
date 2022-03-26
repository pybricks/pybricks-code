// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

/** Action that indicates that a code editor was created. */
export const editorDidCreate = createAction(() => ({
    type: 'editor.action.didCreate',
}));

/**
 * Action that requests getting the current contents of the editor.
 * @param id A unique identifier for this request.
 */
export const editorGetValueRequest = createAction((id: number) => ({
    type: 'editor,action.getCurrentScriptRequest',
    id,
}));

/**
 * Action that responds to {@link editorGetCurrentScriptRequest}.
 * @param id The id that matches {@link editorGetCurrentScriptRequest}.
 * @param value The current editor contents.
 */
export const editorGetValueResponse = createAction((id: number, value: string) => ({
    type: 'editor,action.getCurrentScriptResponse',
    id,
    value,
}));
