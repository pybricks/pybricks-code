// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { Action } from 'redux';

export enum EditorActionType {
    /** The current (active) editor changed. */
    Current = 'editor.action.current',
    /** Save the current file to disk. */
    SaveAs = 'editor.action.saveAs',
    /** Saving the file succeeded. */
    DidSaveAs = 'editor.action.didSaveAs',
    /** Saving the file failed. */
    DidFailToSaveAs = 'editor.action.didFailToSaveAs',
    /** Open a file. */
    Open = 'editor.action.open',
}

export type CurrentEditorAction = Action<EditorActionType.Current> & {
    editSession: monaco.editor.ICodeEditor | undefined;
};

/**
 * Sets the current (active) edit session.
 * @param editSession The new edit session.
 */
export function setEditSession(
    editSession: monaco.editor.ICodeEditor | undefined,
): CurrentEditorAction {
    return { type: EditorActionType.Current, editSession };
}

/**
 * Action that saves the current file.
 */
export type EditorSaveAsAction = Action<EditorActionType.SaveAs>;

/**
 * Creates an action to save the current file
 */
export function saveAs(): EditorSaveAsAction {
    return { type: EditorActionType.SaveAs };
}

/** Action that indicates saving a file succeeded. */
export type EditorDidSaveAsAction = Action<EditorActionType.DidSaveAs>;

/** Action that indicates saving a file succeeded. */
export function didSaveAs(): EditorDidSaveAsAction {
    return { type: EditorActionType.DidSaveAs };
}

/** Action that indicates saving a file failed. */
export type EditorDidFailToSaveAsAction = Action<EditorActionType.DidFailToSaveAs> & {
    err: Error;
};

/** Action that indicates saving a file failed. */
export function didFailToSaveAs(err: Error): EditorDidFailToSaveAsAction {
    return { type: EditorActionType.DidFailToSaveAs, err };
}

/**
 * Action that opens a file.
 */
export type EditorOpenAction = Action<EditorActionType.Open> & {
    /** The data to save */
    data: ArrayBuffer;
};

/**
 * Creates an action to save a file
 * @param data The file data
 */
export function open(data: ArrayBuffer): EditorOpenAction {
    return { type: EditorActionType.Open, data };
}

/**
 * Common type for all editor actions.
 */
export type EditorAction =
    | CurrentEditorAction
    | EditorOpenAction
    | EditorSaveAsAction
    | EditorDidSaveAsAction
    | EditorDidFailToSaveAsAction;
