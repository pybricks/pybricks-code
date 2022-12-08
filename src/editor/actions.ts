// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';
import { UUID } from '../fileStorage';
export {
    didFailToInit as editorCompletionDidFailToInit,
    didInit as editorCompletionDidInit,
    init as editorCompletionInit,
} from './redux/codeCompletion';

/** Action that indicates that a code editor was created. */
export const editorDidCreate = createAction(() => ({
    type: 'editor.action.didCreate',
}));

/**
 * Action that requests getting the current contents of the editor.
 * @param id A unique identifier for this request.
 */
export const editorGetValueRequest = createAction((id: number) => ({
    type: 'editor.action.getCurrentScriptRequest',
    id,
}));

/**
 * Action that responds to {@link editorGetCurrentScriptRequest}.
 * @param id The id that matches {@link editorGetCurrentScriptRequest}.
 * @param value The current editor contents.
 */
export const editorGetValueResponse = createAction((id: number, value: string) => ({
    type: 'editor.action.getCurrentScriptResponse',
    id,
    value,
}));

/**
 * Requests to open a file in the editor.
 * @param uuid The file UUID.
 */
export const editorOpenFile = createAction((uuid: UUID) => ({
    type: 'editor.action.openFile',
    uuid,
}));

/**
 * Indicates that {@link editorOpenFile} succeeded.
 * @param uuid The file UUID.
 */
export const editorDidOpenFile = createAction((uuid: UUID) => ({
    type: 'editor.action.didOpenFile',
    uuid,
}));

/**
 * Indicates that {@link editorOpenFile} failed.
 * @param uuid The file UUID.
 * @param error the error.
 */
export const editorDidFailToOpenFile = createAction((uuid: UUID, error: Error) => ({
    type: 'editor.action.didFailToOpenFile',
    uuid,
    error,
}));

/**
 * Requests to close a file in the editor.
 * @param uuid The file UUID.
 */
export const editorCloseFile = createAction((uuid: UUID) => ({
    type: 'editor.action.closeFile',
    uuid,
}));

/**
 * Indicates that {@link editorCloseFile} completed.
 *
 * Unlike most actions, this does not have a "did fail" counterpart.
 *
 * @param uuid The file UUID.
 */
export const editorDidCloseFile = createAction((uuid: UUID) => ({
    type: 'editor.action.didCloseFile',
    uuid,
}));

/**
 * Request to activate a file (open or bring to foreground if already open).
 * @param uuid The file UUID.
 */
export const editorActivateFile = createAction((uuid: UUID) => ({
    type: 'editor.action.activateFile',
    uuid,
}));

/**
 * Indicates that {@link editorActivateFile} succeeded.
 * @param uuid The file UUID.
 */
export const editorDidActivateFile = createAction((uuid: UUID) => ({
    type: 'editor.action.didActivateFile',
    uuid,
}));

/**
 * Indicates that {@link editorActivateFile} failed.
 * @param uuid The file UUID.
 * @param error The error that was raised.
 */
export const editorDidFailToActivateFile = createAction((uuid: UUID, error: Error) => ({
    type: 'editor.action.didFailToActivateFile',
    uuid,
    error,
}));

/**
 * Requests to activate a file and show line.
 */
export const editorGoto = createAction((uuid: UUID, line: number) => ({
    type: 'editor.action.goto',
    uuid,
    line,
}));

export const editorActivateExample = createAction(
    (fileName: string, content: string) => ({
        type: 'editor.action.activateExample',
        fileName,
        content,
    }),
);
