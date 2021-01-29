// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
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
    editSession: Ace.EditSession | undefined;
};

/**
 * Sets the current (active) edit session.
 * @param editSession The new edit session.
 */
export function setEditSession(
    editSession: Ace.EditSession | undefined,
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
};

/**
 * Creates an action to save a file
 * @param data The file data
 */
export function open(data: ArrayBuffer): EditorOpenAction {
    return { type: EditorActionType.Open, data };
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
