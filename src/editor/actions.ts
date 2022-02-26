// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { createAction } from '../actions';

/**
 * Sets the current (active) edit session.
 * @param editSession The new edit session.
 */
export const setEditSession = createAction(
    (editSession: monaco.editor.ICodeEditor | undefined) => ({
        type: 'editor.action.setEditSession',
        editSession,
    }),
);

/**
 * Creates an action to save the current file
 */
export const saveAs = createAction(() => ({
    type: 'editor.action.saveAs',
}));

/** Action that indicates saving a file succeeded. */
export const didSaveAs = createAction(() => ({
    type: 'editor.action.didSaveAs',
}));

/** Action that indicates saving a file failed. */
export const didFailToSaveAs = createAction((err: Error) => ({
    type: 'editor.action.didFailToSaveAs',
    err,
}));

/**
 * Creates an action to save a file
 * @param data The file data
 */
export const open = createAction((data: ArrayBuffer) => ({
    type: 'editor.action.open',
    data,
}));
