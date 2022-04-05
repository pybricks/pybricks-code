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
/**
 * Request to activate a file (open or bring to foreground if already open).
 * @param fileName The file name.
 */
export const editorActivateFile = createAction((fileName: string) => ({
    type: 'editor.action.activateFile',
    fileName,
}));

/**
 * Indicates that {@link editorActivateFile} succeeded.
 * @param fileName The file name.
 */
export const editorDidActivateFile = createAction((fileName: string) => ({
    type: 'editor.action.didActivateFile',
    fileName,
}));

/**
 * Indicates that {@link editorActivateFile} failed.
 * @param fileName The file name.
 * @param error The error that was raised.
 */
export const editorDidFailToActivateFile = createAction(
    (fileName: string, error: Error) => ({
        type: 'editor.action.didFailToActivateFile',
        fileName,
        error,
    }),
);
