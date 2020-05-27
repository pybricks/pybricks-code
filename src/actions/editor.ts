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
}

export interface CurrentEditorAction extends Action<EditorActionType.Current> {
    editSession: Ace.EditSession | undefined;
}

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
export interface EditorOpenAction extends Action<EditorActionType.Open> {
    /** The data to save */
    data: ArrayBuffer;
}

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
export type EditorAction = CurrentEditorAction | EditorOpenAction | EditorSaveAsAction;
