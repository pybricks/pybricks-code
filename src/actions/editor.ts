import { Ace } from 'ace-builds';
import { Action } from 'redux';

export enum EditorActionType {
    /**
     * The current (active) editor changed.
     */
    Current = 'editor.action.current',
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
