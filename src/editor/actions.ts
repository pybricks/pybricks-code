// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { Action } from 'redux';

export enum EditorActionType {
    /**
     * The current (active) editor changed.
     */
    Current = 'editor.action.current',
    /**
     * Save the current file to disk.
     */
    SaveAs = 'editor.action.saveAs',
    /**
     * Open a file.
     */
    Open = 'editor.action.open',
    /**
     * Storage was changed outside of the app.
     */
    StorageChanged = 'editor.action.storageChanged',
    /**
     * Reload program from local storage.
     */
    ReloadProgram = 'editor.action.reloadProgram',
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

/**
 * Action that opens a file.
 */
export type EditorOpenAction = Action<EditorActionType.Open> & {
    /** The data to save */
    data: ArrayBuffer;
    /** name of the file opened */
    filename: string;
};

/**
 * Creates an action to save a file
 * @param data The file data
 */
export function open(data: ArrayBuffer, filename: string): EditorOpenAction {
    return { type: EditorActionType.Open, data, filename };
}

/**Action that indicates the local storage has changed. */
export type EditorStorageChangedAction = Action<EditorActionType.StorageChanged> & {
    newValue: string;
};

/**
 * Creates an action that indicates the local storage has changed.
 * @param newValue The new program.
 */
export function storageChanged(newValue: string): EditorStorageChangedAction {
    return { type: EditorActionType.StorageChanged, newValue };
}

/** Action to request reloading the program from local storage. */
export type EditorReloadProgramAction = Action<EditorActionType.ReloadProgram>;

/** Creates and action to request reloading the program from local storage. */
export function reloadProgram(): EditorReloadProgramAction {
    return { type: EditorActionType.ReloadProgram };
}

/**
 * Common type for all editor actions.
 */
export type EditorAction =
    | CurrentEditorAction
    | EditorOpenAction
    | EditorSaveAsAction
    | EditorStorageChangedAction
    | EditorReloadProgramAction;
